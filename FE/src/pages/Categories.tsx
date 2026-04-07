import React, { useState } from 'react';
import { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Image: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (cat: Category) => {
    setFormData({
      Name: cat.Name,
      Description: cat.Description || '',
      Image: cat.Image || ''
    });
    setEditingId(cat.CategoryID);
  };

  const handleClear = () => {
    setFormData({ Name: '', Description: '', Image: '' });
    setEditingId(null);
  };

  const handleSave = () => {
    alert(editingId ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
    handleClear();
  }

  const filtered = categories.filter(c => c.Name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid">
      <div className="card">
        <div className="products-header">
          <h3>Quản lý Danh mục Loa</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="btn btn-jbl" onClick={() => setEditingId(0)}>+ Thêm mới</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="empty-message">Không tìm thấy danh mục</td></tr>
            ) : (
              filtered.map((cat, index) => (
                <tr key={cat.CategoryID}>
                  <td>{index + 1}</td>
                  <td className="font-semibold">{cat.Name}</td>
                  <td>{cat.Description}</td>
                  <td>{cat.CreatedAt}</td>
                  <td className="text-right">
                    <button className="btn btn-edit" onClick={() => handleEdit(cat)}>Sửa</button>
                    <button className="btn btn-delete">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingId !== null && (
        <div className="modal-overlay">
          <div className="card">
            <h3>{editingId === 0 ? 'Thêm danh mục mới' : 'Sửa danh mục'}</h3>
            <div className="form-row">
              <input name="Name" placeholder="Tên danh mục" value={formData.Name} onChange={handleInputChange} />
            </div>
            <div className="form-row">
              <textarea name="Description" placeholder="Mô tả" value={formData.Description} onChange={handleInputChange} rows={3} />
            </div>
            <div className="form-row">
              <input name="Image" placeholder="Đường dẫn ảnh" value={formData.Image} onChange={handleInputChange} />
            </div>
            <div className="form-actions">
              <button className="btn btn-jbl" onClick={handleSave}>Cập nhật danh mục</button>
              <button className="btn btn-cancel" onClick={handleClear}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
