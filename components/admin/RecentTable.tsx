interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface RecentTableProps<T> {
  title: string;
  icon: React.ReactNode;
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function RecentTable<T extends { id: string }>({
  title,
  icon,
  columns,
  rows,
  emptyMessage = "No records yet",
  viewAllHref,
  viewAllLabel = "View All",
}: RecentTableProps<T>) {
  return (
    <div className="admin-recent-table">
      <div className="admin-recent-table__header">
        <div className="admin-recent-table__title-group">
          <span className="admin-recent-table__icon">{icon}</span>
          <h3 className="admin-recent-table__title">{title}</h3>
        </div>
        {viewAllHref && (
          <a href={viewAllHref} className="admin-recent-table__view-all">
            {viewAllLabel}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 3L9 7L5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="admin-recent-table__empty">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <path
              d="M12 16H20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="admin-recent-table__scroll">
          <table className="admin-recent-table__table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={
                      col.hideOnMobile
                        ? "admin-recent-table__th admin-recent-table__hide-mobile"
                        : "admin-recent-table__th"
                    }
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="admin-recent-table__tr">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={
                        col.hideOnMobile
                          ? "admin-recent-table__td admin-recent-table__hide-mobile"
                          : "admin-recent-table__td"
                      }
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
