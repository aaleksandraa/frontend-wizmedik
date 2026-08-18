import { Button } from '@/components/ui/button';

export type AdminListMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export const defaultAdminListMeta: AdminListMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function parseAdminListPayload(payload: any, fallbackPage = 1, fallbackPerPage = 20): { list: any[]; meta: AdminListMeta } {
  if (!payload) {
    return { list: [], meta: { ...defaultAdminListMeta, current_page: fallbackPage, per_page: fallbackPerPage } };
  }

  if (Array.isArray(payload)) {
    return {
      list: payload,
      meta: {
        current_page: fallbackPage,
        last_page: 1,
        per_page: fallbackPerPage,
        total: payload.length,
      },
    };
  }

  const nestedData = payload.data;
  const list = Array.isArray(nestedData)
    ? nestedData
    : Array.isArray(nestedData?.data)
      ? nestedData.data
      : [];

  const pagination = payload.pagination
    || (nestedData && !Array.isArray(nestedData) ? nestedData : null)
    || payload;

  return {
    list,
    meta: {
      current_page: Number(pagination.current_page || fallbackPage),
      last_page: Number(pagination.last_page || 1),
      per_page: Number(pagination.per_page || fallbackPerPage),
      total: Number(pagination.total || list.length || 0),
    },
  };
}

export function AdminListPager({
  meta,
  loading = false,
  onPageChange,
}: {
  meta: AdminListMeta;
  loading?: boolean;
  onPageChange: (page: number) => void;
}) {
  if (meta.total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {meta.total} rezultata · stranica {meta.current_page} / {meta.last_page}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={meta.current_page <= 1 || loading}
          onClick={() => onPageChange(Math.max(meta.current_page - 1, 1))}
        >
          Prethodna
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={meta.current_page >= meta.last_page || loading}
          onClick={() => onPageChange(Math.min(meta.current_page + 1, meta.last_page))}
        >
          Sljedeća
        </Button>
      </div>
    </div>
  );
}
