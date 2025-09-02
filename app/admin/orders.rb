ActiveAdmin.register Order do
  permit_params :user_id, :total, :status

  # Add to the same parent menu as Users
  menu parent: "User Management", priority: 2

  index do
    selectable_column
    id_column
    column :user
    column :total
    column :status
    column :created_at
    actions do |order|
      item "View Order", admin_order_path(order), class: "member_link"
      item "Edit Order", edit_admin_order_path(order), class: "member_link"
      item "Process Order", "#", class: "member_link"
      item "Cancel Order", "#", class: "member_link"
      item "Delete", admin_order_path(order), method: :delete, class: "member_link", confirm: "Are you sure?"
    end
  end

  show do
    attributes_table do
      row :id
      row :user
      row :total
      row :status
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs do
      f.input :user
      f.input :total
      f.input :status, as: :select, collection: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    end
    f.actions
  end
end
