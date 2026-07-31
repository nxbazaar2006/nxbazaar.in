"use client";
import React from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation"; type PaginateProps = { totalPages: number; isSearch?: boolean;
};
export default function Paginate({ totalPages, isSearch }: PaginateProps) { const searchParams = useSearchParams(); const sort = searchParams.get("sort") || "asc"; const min = searchParams.get("min") || "0"; const max = searchParams.get("max") || ""; const searchTerm = searchParams.get("search") || ""; const currentPage = Number.parseInt(searchParams.get("page") || "1", 10) || 1; const hrefForPage = (page: number) => {
const params = new URLSearchParams({ page: String(page), sort, min, max, }); if (isSearch) params.set("search", searchTerm); return `?${params.toString()}`; };
const previousPage = currentPage === 1 ? 1 : currentPage - 1; const nextPage = currentPage === totalPages ? totalPages : currentPage + 1; return ( <Pagination> <PaginationContent> <PaginationItem> <PaginationPrevious href={hrefForPage(previousPage)} /> </PaginationItem> {totalPages <= 3 ? ( Array.from({ length: totalPages }, (_, index) => ( <PaginationItem key={index}> <PaginationLink isActive={index + 1 === currentPage} href={hrefForPage(index + 1)} > {index + 1} </PaginationLink> </PaginationItem> )) ) : ( <> {Array.from({ length: 3 }, (_, index) => ( <PaginationItem key={index}> <PaginationLink href={hrefForPage(index + 1)}> {index + 1} </PaginationLink> </PaginationItem> ))} <PaginationItem> <PaginationEllipsis /> </PaginationItem> </> )} <PaginationItem> <PaginationNext href={hrefForPage(nextPage)} /> </PaginationItem> </PaginationContent> </Pagination> );
}