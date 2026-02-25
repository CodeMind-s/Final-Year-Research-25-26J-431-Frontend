"use client";

import { useEffect, useState, useCallback } from "react";
import { adminController } from "@/services/admin.controller";
import { Plan, CreatePlanRequest, UpdatePlanRequest } from "@/dtos/admin.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState<CreatePlanRequest>({
    key: "",
    name: "",
    level: 0,
    priceMonthlyLKR: 0,
    priceAnnualLKR: 0,
    featureKeys: [],
    duration: "monthly",
  });
  const [createFeatures, setCreateFeatures] = useState("");

  // Edit form
  const [editForm, setEditForm] = useState<UpdatePlanRequest>({});
  const [editFeatures, setEditFeatures] = useState("");

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminController.getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminController.createPlan({
        ...createForm,
        featureKeys: createFeatures
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setCreateOpen(false);
      setCreateForm({
        key: "",
        name: "",
        level: 0,
        priceMonthlyLKR: 0,
        priceAnnualLKR: 0,
        featureKeys: [],
        duration: "monthly",
      });
      setCreateFeatures("");
      await fetchPlans();
    } catch (err) {
      console.error("Failed to create plan:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setEditForm({
      name: plan.name,
      level: plan.level,
      priceMonthlyLKR: plan.priceMonthlyLKR,
      priceAnnualLKR: plan.priceAnnualLKR,
      duration: plan.duration,
      isActive: plan.isActive,
    });
    setEditFeatures(plan.featureKeys.join(", "));
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      await adminController.updatePlan(selectedPlan.key, {
        ...editForm,
        featureKeys: editFeatures
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setEditOpen(false);
      setSelectedPlan(null);
      await fetchPlans();
    } catch (err) {
      console.error("Failed to update plan:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      await adminController.deletePlan(selectedPlan.key);
      setDeleteOpen(false);
      setSelectedPlan(null);
      await fetchPlans();
    } catch (err) {
      console.error("Failed to delete plan:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-sm text-muted-foreground">
            Manage subscription plans
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading plans...</p>
      ) : plans.length === 0 ? (
        <p className="text-muted-foreground">No plans found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.key}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Key: <code className="bg-muted px-1 rounded">{plan.key}</code>
                  </p>
                </div>
                <div className="flex gap-1">
                  <Badge variant={plan.isActive ? "default" : "destructive"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Level</span>
                    <p className="font-medium">{plan.level}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-medium">{plan.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Monthly</span>
                    <p className="font-medium">
                      LKR {plan.priceMonthlyLKR.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Annual</span>
                    <p className="font-medium">
                      LKR {plan.priceAnnualLKR.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Features</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.featureKeys.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(plan)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {plan.key !== "free" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Plan</DialogTitle>
            <DialogDescription>
              Add a new subscription plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  value={createForm.key}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, key: e.target.value }))
                  }
                  placeholder="e.g. enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Enterprise Plan"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Input
                  type="number"
                  value={createForm.level}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      level: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={createForm.duration}
                  onValueChange={(val) =>
                    setCreateForm((f) => ({ ...f, duration: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price (LKR)</Label>
                <Input
                  type="number"
                  value={createForm.priceMonthlyLKR}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      priceMonthlyLKR: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Price (LKR)</Label>
                <Input
                  type="number"
                  value={createForm.priceAnnualLKR}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      priceAnnualLKR: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feature Keys (comma-separated)</Label>
              <Input
                value={createFeatures}
                onChange={(e) => setCreateFeatures(e.target.value)}
                placeholder="weather_data, salinity, deals"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan: {selectedPlan?.key}</DialogTitle>
            <DialogDescription>
              Update plan configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Input
                  type="number"
                  value={editForm.level ?? 0}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      level: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={editForm.duration || "monthly"}
                  onValueChange={(val) =>
                    setEditForm((f) => ({ ...f, duration: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price (LKR)</Label>
                <Input
                  type="number"
                  value={editForm.priceMonthlyLKR ?? 0}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      priceMonthlyLKR: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Price (LKR)</Label>
                <Input
                  type="number"
                  value={editForm.priceAnnualLKR ?? 0}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      priceAnnualLKR: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feature Keys (comma-separated)</Label>
              <Input
                value={editFeatures}
                onChange={(e) => setEditFeatures(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate the{" "}
              <strong>{selectedPlan?.name}</strong> plan? Existing subscribers
              will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
