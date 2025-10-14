import subCategoryModel from '../models/subCategoryModel.js';

// Add sub-category
const addSubCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.json({ success: false, message: "Sub-category name is required" });
    }
    try {
        const exists = await subCategoryModel.findOne({ name });
        if (exists) {
            return res.json({ success: false, message: "Sub-category already exists" });
        }
        const newSubCategory = new subCategoryModel({ name });
        await newSubCategory.save();
        res.json({ success: true, message: "Sub-category Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding sub-category" });
    }
};

// List all sub-categories
const listSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel.find({}).sort({ name: 1 });
        res.json({ success: true, subCategories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching sub-categories" });
    }
};

// Remove sub-category
const removeSubCategory = async (req, res) => {
    const { id } = req.body;
    try {
        await subCategoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Sub-category Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing sub-category" });
    }
};

export { addSubCategory, listSubCategories, removeSubCategory };