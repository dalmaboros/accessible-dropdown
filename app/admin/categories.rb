ActiveAdmin.register Category do
  permit_params :name, :description

  # Create a parent menu item for "Content Management"
  menu parent: "Content Management", priority: 1

  index do
    selectable_column
    id_column
    column :name
    column :description
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :description
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs do
      f.input :name
      f.input :description
    end
    f.actions
  end
end
