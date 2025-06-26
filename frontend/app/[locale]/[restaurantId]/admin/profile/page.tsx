'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/language-selector';
import { Users, Plus, Edit, Trash2, MenuIcon, DollarSign, User as UserIcon, Mail, Phone, Utensils } from 'lucide-react';
import { User, MenuItem } from '@/lib/types';


const userRoles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'staff', label: 'Staff Member' },
  { value: 'viewer', label: 'Viewer' },
];

const menuCategories = [
  { value: 'appetizer', label: 'Appetizers' },
  { value: 'main', label: 'Main Courses' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'beverage', label: 'Beverages' },
];

export default function ProfilePage() {
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', role: '', phone: '', password: '' });
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState<Omit<MenuItem, 'id' | 'price'> & { price: string }>({ name: '', description: '', price: '', category: '' });
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchMenuItems();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
    setLoadingUsers(false);
  };

  const fetchMenuItems = async () => {
    setLoadingMenuItems(true);
    const response = await fetch('/api/menu-items');
    const data = await response.json();
    setMenuItems(data);
    setLoadingMenuItems(false);
  };

  // User management functions
  const handleAddUser = async () => {
    if (newUser.name && newUser.email && newUser.role) {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        fetchUsers();
        setNewUser({ name: '', email: '', role: '', phone: '', password: '' });
        setShowAddUser(false);
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser(user);
    setShowAddUser(true);
  };

  const handleUpdateUser = async () => {
    if (editingUser && newUser.name && newUser.email && newUser.role) {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        fetchUsers();
        setNewUser({ name: '', email: '', role: '', phone: '', password: '' });
        setShowAddUser(false);
        setEditingUser(null);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchUsers();
    }
  };

  // Menu item management functions
  const handleAddMenuItem = async () => {
    if (newMenuItem.name && newMenuItem.price && newMenuItem.category) {
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMenuItem, price: parseFloat(newMenuItem.price) }),
      });
      if (response.ok) {
        fetchMenuItems();
        setNewMenuItem({ name: '', description: '', price: '', category: '' });
        setShowAddMenuItem(false);
      }
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setNewMenuItem({ ...item, price: item.price.toString() });
    setShowAddMenuItem(true);
  };

  const handleUpdateMenuItem = async () => {
    if (editingMenuItem && newMenuItem.name && newMenuItem.price && newMenuItem.category) {
      const response = await fetch(`/api/menu-items/${editingMenuItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMenuItem, price: parseFloat(newMenuItem.price) }),
      });
      if (response.ok) {
        fetchMenuItems();
        setNewMenuItem({ name: '', description: '', price: '', category: '' });
        setShowAddMenuItem(false);
        setEditingMenuItem(null);
      }
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    const response = await fetch(`/api/menu-items/${itemId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchMenuItems();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appetizer': return 'bg-green-100 text-green-800';
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'dessert': return 'bg-purple-100 text-purple-800';
      case 'beverage': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profile & Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage users and menu items for your restaurant
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* Manage Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>Add, edit, and manage restaurant staff members</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddUser(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit User Form */}
          {showAddUser && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    id="userName"
                    placeholder="Full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="email@restaurant.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    placeholder="Enter a password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="userPhone">Phone</Label>
                  <Input
                    id="userPhone"
                    placeholder="+1234567890"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>
                  {editingUser ? 'Update User' : 'Add User'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddUser(false);
                    setEditingUser(null);
                    setNewUser({ name: '', email: '', role: '', phone: '', password: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : !Array.isArray(users) || users.length === 0 ? (
              <p>No users found. Please add a new user.</p>
            ) : (
              users.map((user) => (
                <Card key={user.id} className="relative">
                  <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      {userRoles.find(r => r.value === user.role)?.label || user.role}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteUser(user.id)}
                      className="hover:bg-red-100 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manage Menu Items Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5" />
              <div>
                <CardTitle>Manage Menu Items</CardTitle>
                <CardDescription>Add, edit, and organize your restaurant menu</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddMenuItem(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Menu Item</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Menu Item Form */}
          {showAddMenuItem && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Name</Label>
                  <Input
                    id="itemName"
                    placeholder="Dish name"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemPrice">Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="itemPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Input
                    id="itemDescription"
                    placeholder="Description of the dish"
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemCategory">Category</Label>
                  <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem({ ...newMenuItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}>
                  {editingMenuItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddMenuItem(false);
                    setEditingMenuItem(null);
                    setNewMenuItem({ name: '', description: '', price: '', category: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Menu Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingMenuItems ? (
              <p>Loading menu items...</p>
            ) : menuItems.length === 0 ? (
              <p>No menu items found. Please add a new item.</p>
            ) : (
              menuItems.map((item) => (
                <Card key={item.id} className="relative">
                  <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MenuIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <Badge className={getCategoryColor(item.category)}>
                      {menuCategories.find(c => c.value === item.category)?.label || item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditMenuItem(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="hover:bg-red-100 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
