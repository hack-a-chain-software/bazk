import { useMemo } from "react";

export interface UsePaginateInterface {
  items: any[],
  currentPage: number,
  itemsPerPage: number,
}

export const range = (start: number, end: number) => {
  const length = end - start + 1;

  return Array.from({ length }, (_, i) => start + i);
};

export const chunk = (array: any[], perChunk: number) => {
  return array.reduce((resultArray: any[], item: any, index: number) => {
    const chunkIndex = Math.floor(index/perChunk)

    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])
}

export const usePaginate = (props: UsePaginateInterface) => {
  const {
    items,
    currentPage = 1,
    itemsPerPage = 8,
  } = props

  const pages = useMemo(() => {
    return chunk(items, itemsPerPage)
  }, [items, itemsPerPage])

  const page = useMemo(() => {
    return pages[Math.max(0, currentPage - 1)]
  }, [pages, currentPage])

  const totalItems = useMemo(() => items.length, [items])

  const totalPages = useMemo(() => pages.length, [pages])

  return {
    page,
    pages,
    totalItems,
    totalPages,
  }
}

export default usePaginate
