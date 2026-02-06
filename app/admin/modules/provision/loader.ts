import { getModule } from "@/app/actions/module-editor";
import { ModuleData, SlideData, ModuleContent } from "./types";
import { toast } from "sonner";

export async function loadModuleWithRecovery(moduleId: number, r2Domain: string): Promise<ModuleData | null> {
    try {
        const res = await getModule(moduleId);
        if (!res.success || !res.data) {
            toast.error("Failed to load module");
            return null;
        }

        let mainData = res.data;
        let content = (mainData.content as unknown as ModuleContent) || { training: { slides: [] }, assessment: { slides: [] } };
        const isLegacyTest = (mainData as any).type === 'TEST';

        // Migration: If legacy format (direct slides array), move to appropriate section
        const rawContent = content as any;
        if (Array.isArray(rawContent.slides)) {
            if (isLegacyTest) {
                content = {
                    training: { slides: [] },
                    assessment: { slides: rawContent.slides }
                };
            } else {
                content = {
                    training: { slides: rawContent.slides },
                    assessment: { slides: [] }
                };
            }
        }

        // Ensure structure exists
        if (!content.training) content.training = { slides: [] };
        if (!content.assessment) content.assessment = { slides: [] };

        // SMART MERGE: Linked Module Logic
        if (content.assessment.slides.length === 0 && (mainData as any).linked_module_id) {
            try {
                const linkedId = (mainData as any).linked_module_id;
                const linkedRes = await getModule(linkedId);
                if (linkedRes.success && linkedRes.data) {
                    const linkedContent = (linkedRes.data as any).content || {};
                    const linkedSlides = (linkedContent as any).slides || (linkedContent as any).assessment?.slides || (linkedContent as any).training?.slides || [];

                    if (linkedSlides.length > 0) {
                        content.assessment.slides = linkedSlides;
                        mainData.pass_marks = mainData.pass_marks || linkedRes.data.pass_marks;
                        mainData.total_marks = mainData.total_marks || linkedRes.data.total_marks;
                        toast.info("Imported assessment data from linked module.");
                    }
                }
            } catch (err) {
                console.error("Failed to fetch linked module for merge", err);
            }
        }

        // DEEP RECOVERY: R2 Logic
        if (content.assessment.slides.length === 0 && r2Domain) {
            try {
                // STEP 1: canonical content.json
                const contentJsonUrl = `${r2Domain}/${mainData.id}/content.json`;
                let recovered = false;

                try {
                    const contentRes = await fetch(contentJsonUrl, { next: { revalidate: 0 } });
                    if (contentRes.ok) {
                        const contentData = await contentRes.json();
                        if (contentData?.assessment?.slides?.length > 0) {
                            content.assessment.slides = contentData.assessment.slides;
                            // Recover translations if present
                            if (contentData.translations) {
                                content.translations = {
                                    ...(content.translations || {}),
                                    ...contentData.translations
                                };
                            }

                            mainData.pass_marks = contentData.pass_marks || mainData.pass_marks;
                            mainData.total_marks = contentData.total_marks || mainData.total_marks;
                            toast.success("Recovered assessment from content.json!");
                            recovered = true;
                        }
                    }
                } catch (e) {
                    // ignore
                }

                // STEP 2: Tmp_EN.js fallback
                if (!recovered) {
                    const safeName = (mainData.title || 'module').replace(/[^a-z0-9]/gi, '_');
                    let r2Url = `${r2Domain}/${mainData.id}/${mainData.id}_${safeName}_test_Tmp_EN.js`;

                    let r2Res = await fetch(r2Url, { next: { revalidate: 0 } });
                    if (!r2Res.ok) {
                        const altSafeName = safeName.replace(/_+/g, '_').replace(/^_|_$/g, '');
                        r2Url = `${r2Domain}/${mainData.id}/${mainData.id}_${altSafeName}_test_Tmp_EN.js`;
                        r2Res = await fetch(r2Url, { next: { revalidate: 0 } });
                    }

                    if (r2Res.ok) {
                        const recoveryData = await r2Res.json();
                        if (recoveryData && Array.isArray(recoveryData.slides)) {
                            const transformedSlides = recoveryData.slides.map((exportSlide: any, idx: number) => {
                                // Transformation logic for recovered slides
                                const contentParts = (exportSlide.content || "").split("\n\n").filter((p: string) => p.trim());
                                const elements = contentParts.map((text: string, elIdx: number) => ({
                                    id: `el-recovered-${idx}-${elIdx}`,
                                    type: "text",
                                    content: text.trim(),
                                    style: {
                                        width: 100, height: 20,
                                        fontSize: elIdx === 0 ? 24 : 16,
                                        color: elIdx === 0 ? "#ff6b6b" : "#ffffff",
                                        fontWeight: elIdx === 0 ? "bold" : "normal",
                                        textAlign: "center"
                                    },
                                    animation: { type: "fade-in", delay: elIdx * 0.2, duration: 0.5 }
                                }));
                                return {
                                    id: exportSlide.id,
                                    title: contentParts[0]?.substring(0, 30) || `Slide ${idx + 1}`,
                                    content: exportSlide.content || "",
                                    elements
                                };
                            });

                            content.assessment.slides = transformedSlides;
                            toast.success(`Recovered ${transformedSlides.length} assessment slides from R2!`);

                            // Recover translations (Languages.js)
                            const r2LangUrl = `${r2Domain}/${mainData.id}/${mainData.id}_${safeName}_test_Languages.js`;
                            const langRes = await fetch(r2LangUrl, { next: { revalidate: 0 } });
                            if (langRes.ok) {
                                const langData = await langRes.json();
                                if (langData.translations) {
                                    const existingTranslations = content.translations || {};
                                    Object.keys(langData.translations).forEach(code => {
                                        existingTranslations[code] = {
                                            ...(existingTranslations[code] || {}),
                                            ...(langData.translations[code].slides || langData.translations[code])
                                        };
                                    });
                                    content.translations = existingTranslations;
                                    toast.success("Recovered translations from R2!");
                                }
                            }
                        }
                    }
                }

            } catch (recoveryErr) {
                console.warn("Deep recovery failed:", recoveryErr);
            }
        }

        // Return fully constructed module data
        return {
            ...mainData,
            content: content as ModuleContent,
            isPublished: mainData.is_published,
            pass_marks: mainData.pass_marks || 0,
            total_marks: mainData.total_marks || 0
        } as ModuleData;

    } catch (e) {
        console.error(e);
        return null;
    }
}
