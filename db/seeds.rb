# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create admin user
AdminUser.create!(email: 'admin@example.com', password: 'password', password_confirmation: 'password') if Rails.env.development?

# Create sample users
john = User.create!(name: 'John Doe', email: 'john@example.com', role: 'admin')
jane = User.create!(name: 'Jane Smith', email: 'jane@example.com', role: 'user')
bob = User.create!(name: 'Bob Johnson', email: 'bob@example.com', role: 'moderator')
alice = User.create!(name: 'Alice Brown', email: 'alice@example.com', role: 'user')
charlie = User.create!(name: 'Charlie Wilson', email: 'charlie@example.com', role: 'admin')

# Create sample categories
Category.create!(name: 'Electronics', description: 'Electronic devices and gadgets')
Category.create!(name: 'Clothing', description: 'Apparel and fashion items')
Category.create!(name: 'Books', description: 'Books and educational materials')
Category.create!(name: 'Home & Garden', description: 'Home improvement and garden items')
Category.create!(name: 'Sports', description: 'Sports equipment and athletic gear')

# Create sample products
Product.create!(name: 'iPhone 15', description: 'Latest smartphone from Apple', price: 999.99, category: 'Electronics')
Product.create!(name: 'MacBook Pro', description: 'Professional laptop for developers', price: 1999.99, category: 'Electronics')
Product.create!(name: 'Running Shoes', description: 'Comfortable athletic footwear', price: 89.99, category: 'Sports')
Product.create!(name: 'Coffee Maker', description: 'Automatic coffee brewing machine', price: 149.99, category: 'Home & Garden')
Product.create!(name: 'Programming Book', description: 'Learn Ruby on Rails', price: 49.99, category: 'Books')
Product.create!(name: 'T-Shirt', description: 'Cotton casual wear', price: 19.99, category: 'Clothing')

# Create sample orders
Order.create!(user: john, total: 1049.98, status: 'delivered')
Order.create!(user: jane, total: 89.99, status: 'shipped')
Order.create!(user: bob, total: 199.98, status: 'processing')
Order.create!(user: alice, total: 69.98, status: 'pending')
Order.create!(user: charlie, total: 149.99, status: 'delivered')