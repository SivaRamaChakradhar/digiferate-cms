import { 
    uploadWallpaper, 
    getAllWallpapers, 
    getWallpaperById, 
    updateWallpaper, deleteWallpaper } from "../services/wallpaper.service.js";

const createWallpaper = async (req, res) => {
    try{
        const { name } = req.body;
        const file = req.file;

        if(!name || !name.trim()){
            return res.status(400).json({
                success: false,
                message: "Wallpaper name is required",
            });
        }
        if(!file){
            return res.status(400).json({
                success: false,
                message: "Wallpaper image is required",
            });
        }

        const wallpaper = await uploadWallpaper(name, file);

        return res.status(201).json({
            success: true,
            message: "Wallpaper uploaded successfully",
            data: wallpaper,
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to upload wallpaper",
        })
    }
}

const getWallpapers = async (req, res) => {
    try{
        const wallpapers = await getAllWallpapers();
    
        return res.status(200).json({
            success: true,
            count: wallpapers.length,
            data: wallpapers,
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve wallpapers",
        })
    }
}

const getWallpaper = async (req, res) => {
    try{
        const wallpaperId = await getWallpaperById(req.params.id);
        return res.status(200).json({
            success: true,
            data: wallpaperId,
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve wallpaper",
        })
    }
}

const editWallpaper = async (req, res) => {
  try {
    const wallpaper = await updateWallpaper(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Wallpaper updated successfully",
      data: wallpaper,
    });
  } catch (error) {
    console.error("Update wallpaper error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to update wallpaper",
    });
  }
};

const removeWallpaper = async (req, res) => {
  try {
    const deletedWallpaper = await deleteWallpaper(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Wallpaper deleted successfully",
      data: deletedWallpaper,
    });
  } catch (error) {
    console.error("Delete wallpaper error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to delete wallpaper",
    });
  }
};


export { createWallpaper, getWallpapers, getWallpaper, editWallpaper, removeWallpaper };