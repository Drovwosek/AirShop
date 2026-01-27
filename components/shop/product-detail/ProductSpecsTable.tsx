"use client";

import { Product } from "@/types/product";

interface ProductSpecsTableProps {
  product: Product;
}

export function ProductSpecsTable({ product }: ProductSpecsTableProps) {
  const hasSpecs =
    product.brand ||
    product.category ||
    product.weight ||
    product.dimensions ||
    product.warrantyInformation ||
    product.shippingInformation ||
    product.returnPolicy ||
    (product.minimumOrderQuantity && product.minimumOrderQuantity > 1);

  if (!hasSpecs) return null;

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">
        Характеристики
      </h3>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-xs sm:text-sm">
          <tbody>
            {product.brand && (
              <tr className="border-b border-border">
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium w-1/3 sm:w-auto">
                  Бренд
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">{product.brand}</td>
              </tr>
            )}
            {product.category && (
              <tr className="border-b border-border">
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  Категория
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                  {product.category.replace(/-/g, " ")}
                </td>
              </tr>
            )}
            {product.weight && (
              <tr className="border-b border-border">
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  Вес
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">{product.weight} г</td>
              </tr>
            )}
            {product.dimensions && (
              <tr className="border-b border-border">
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  Размеры
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  {product.dimensions.width} × {product.dimensions.height} ×{" "}
                  {product.dimensions.depth} см
                </td>
              </tr>
            )}
            {product.warrantyInformation && (
              <tr className="border-b border-border">
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  Гарантия
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  {product.warrantyInformation}
                </td>
              </tr>
            )}
            {product.shippingInformation && (
              <tr className="border-b border-border">
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  Доставка
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  {product.shippingInformation}
                </td>
              </tr>
            )}
            {product.returnPolicy && (
              <tr className="border-b border-border last:border-b-0">
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  Возврат
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  {product.returnPolicy}
                </td>
              </tr>
            )}
            {product.minimumOrderQuantity && product.minimumOrderQuantity > 1 && (
              <tr>
                <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  Мин. заказ
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  {product.minimumOrderQuantity} шт.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
