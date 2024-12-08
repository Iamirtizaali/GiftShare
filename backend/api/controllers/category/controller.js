const Category = require('../../models/category');

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists.' });
    }

    const newCategory = new Category({
      name,
      description,
    });

    await newCategory.save();

    res.status(201).json({
      message: 'Category added successfully.',
      category: newCategory,
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      message: 'Categories fetched successfully.',
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
