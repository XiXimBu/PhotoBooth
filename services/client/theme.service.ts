import Theme from "../../models/theme.model";

export interface ThemeListItem {
  _id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  priority: number;
}

const getActiveThemes = async (): Promise<{
  success: boolean;
  themes: ThemeListItem[];
  message?: string;
}> => {
  try {
    const docs = await Theme.find({ isActive: true })
      .sort({ priority: 1, name: 1 })
      .select("name description thumbnailUrl priority")
      .lean()
      .exec();

    const themes: ThemeListItem[] = docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      description: d.description,
      thumbnailUrl: d.thumbnailUrl,
      priority: d.priority,
    }));

    return { success: true, themes };
  } catch (error) {
    console.error("[ThemeService.getActiveThemes]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Không thể tải danh sách chủ đề.";
    return { success: false, themes: [], message };
  }
};

export default { getActiveThemes };
