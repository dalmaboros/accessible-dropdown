ActiveAdmin.register User do
  permit_params :name, :email, :role

  # Create a parent menu item for "User Management"
  menu parent: "User Management", priority: 1

  index do
    selectable_column
    id_column
    column :name
    column :email
    column :role
    column :created_at
    actions do |user|
      item "View Profile", admin_user_path(user), class: "member_link"
      item "Edit Profile", edit_admin_user_path(user), class: "member_link"
      item "Send Email", "#", class: "member_link"
      item "Delete", admin_user_path(user), method: :delete, class: "member_link", confirm: "Are you sure?"
    end
  end

  show do
    attributes_table do
      row :id
      row :name
      row :email
      row :role
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs do
      f.input :name
      f.input :email
      f.input :role, as: :select, collection: ['admin', 'user', 'moderator']
    end
    f.actions
  end
end
