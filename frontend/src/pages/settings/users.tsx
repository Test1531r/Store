import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = 'http://localhost:5000/api/v1';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    branchId: '',
    roleId: '',
  });

  const token = localStorage.getItem('accessToken');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadData = async () => {
    try {
      setLoading(true);

      const [usersRes, branchesRes, rolesRes] = await Promise.all([
        axios.get(`${API}/users`, { headers }),
        axios.get(`${API}/branches`, { headers }),
        axios.get(`${API}/users/roles`, { headers }),
      ]);

      setUsers(usersRes.data.data || []);
      setBranches(branchesRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    try {
      if (
        !formData.firstName ||
        !formData.email ||
        (!editing && !formData.password)
      ) {
        toast.error('Please fill required fields');
        return;
      }

      if (!formData.roleId) {
        toast.error('Please select role');
        return;
      }

      if (editing) {
        await axios.put(
          `${API}/users/${editing.id}`,
          formData,
          { headers }
        );

        toast.success('User updated');
      } else {
        await axios.post(
          `${API}/users`,
          formData,
          { headers }
        );

        toast.success('User created');
      }

      setOpen(false);
      setEditing(null);

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        branchId: '',
        roleId: '',
      });

      loadData();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        'Operation failed'
      );
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id: string) => {
    if (!confirm('Delete user?')) return;

    try {
      await axios.delete(
        `${API}/users/${id}`,
        { headers }
      );

      toast.success('User deleted');

      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <p className="text-muted-foreground">
            Manage system users and permissions
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null);

                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  phone: '',
                  branchId: '',
                  roleId: '',
                });
              }}
            >
              Add User
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit User' : 'Create User'}
              </DialogTitle>

              <DialogDescription>
                Fill all required user information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">

              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    firstName: e.target.value,
                  })
                }
              />

              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastName: e.target.value,
                  })
                }
              />

              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />

              {!editing && (
                <Input
                  placeholder="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />
              )}

              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
              />

              {/* BRANCH */}

              <Select
                value={formData.branchId}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    branchId: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>

                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem
                      key={branch.id}
                      value={branch.id}
                    >
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ROLE */}

              <Select
                value={formData.roleId}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    roleId: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>

                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="w-full"
                onClick={handleSubmit}
              >
                {editing ? 'Update User' : 'Create User'}
              </Button>

            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Users List
          </CardTitle>
        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {users.map((user) => (
                <TableRow key={user.id}>

                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>

                  <TableCell>
                    {user.email}
                  </TableCell>

                  <TableCell>
                    {user.phone || '-'}
                  </TableCell>

                  <TableCell>
                    {user.branch?.name || '-'}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {user.role?.name || '-'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {user.isActive ? (
                      <Badge>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Disabled
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right space-x-2">

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(user);

                        setFormData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                          password: '',
                          phone: user.phone || '',
                          branchId: user.branchId || '',
                          roleId: user.roleId || '',
                        });

                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDelete(user.id)
                      }
                    >
                      Delete
                    </Button>

                  </TableCell>

                </TableRow>
              ))}

              {!loading && users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}

            </TableBody>

          </Table>

        </CardContent>
      </Card>
    </div>
  );
}