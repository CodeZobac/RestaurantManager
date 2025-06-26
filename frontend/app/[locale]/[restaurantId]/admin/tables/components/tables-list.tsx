"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Table } from "@/lib/types";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users } from "lucide-react";
import { TableStatusBadge } from "./table-status-badge";

interface TablesListProps {
  tables: Table[];
  loading: boolean;
  onEditClick?: (table: Table) => void;
  onDeleteClick?: (table: Table) => void;
}

export function TablesList({ tables, loading, onEditClick, onDeleteClick }: TablesListProps) {
  const t = useTranslations("TableManagement");

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{t("noTables")}</h3>
        <p className="text-muted-foreground">
          Start by adding your first table to manage reservations.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <TableComponent>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("capacity")}</TableHead>
            <TableHead>{t("location")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table) => (
            <TableRow key={table.id}>
              <TableCell className="font-medium">{table.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {table.capacity} {t("guests")}
                </div>
              </TableCell>
              <TableCell>
                {table.location || (
                  <span className="text-muted-foreground italic">
                    No location set
                  </span>
                )}
              </TableCell>
              <TableCell>
                <TableStatusBadge status={table.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick?.(table)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t("edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteClick?.(table)}
                    className="hover:bg-red-100 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("delete")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableComponent>
    </div>
  );
}
