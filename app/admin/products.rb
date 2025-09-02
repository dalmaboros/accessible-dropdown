ActiveAdmin.register Product do
  permit_params :name, :description, :price, :category

  # Add to the same parent menu as Categories
  menu parent: "Content Management", priority: 2

  index do
    selectable_column
    id_column
    column :name
    column :description
    column :price
    column :category
    column :created_at
    actions do |product|
      item "View Details", admin_product_path(product), class: "member_link"
      item "Edit Product", edit_admin_product_path(product), class: "member_link"
      item "Duplicate", "#", class: "member_link"
      item "Archive", "#", class: "member_link"
      item "Delete", admin_product_path(product), method: :delete, class: "member_link", confirm: "Are you sure?"
    end
  end

  show do
    attributes_table do
      row :id
      row :name
      row :description
      row :price
      row :category
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs do
      f.input :name
      f.input :description
      f.input :price
      f.input :category, as: :select, collection: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports']
    end
    f.actions
  end
end
