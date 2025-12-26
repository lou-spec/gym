import React from "react";
import _ from "lodash";
import styles from "./styles.module.scss";

// Função auxiliar para formatar valores por tipo de coluna
const formatValue = (column, value) => {
  if (!value) return "";

  if (column.toLowerCase() === "date" || column.toLowerCase() === "data nasc.") {
    const date = new Date(value);
    if (!isNaN(date)) {
      return date.toLocaleDateString("pt-PT");
    }
  }

  if (column.toLowerCase() === "image") {
    const src = value.startsWith("http") ? value : `http://localhost:3000/uploads/${value}`;
    return <img src={src} alt="Img" className={styles.image} />;
  }

  return value;
};

const Table = ({
  columns = [],
  rows = {
    data: [],
    pagination: {},
  },
  pagination = null, // Accept pagination props directly if passed that way or via rows
  onPageChange = () => { },
  sortBy = "",
  sortOrder = "asc",
  onSort = () => { },
}) => {
  // Normalize rows data if passed differently
  const tableData = rows?.data || (Array.isArray(rows) ? rows : []);
  const paging = pagination || rows?.pagination;

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column, index) => {
                const isSortable = column.toLowerCase() !== 'actions' && column.toLowerCase() !== 'image' && column.toLowerCase() !== 'função';
                const isActive = sortBy === column;

                return (
                  <th
                    key={`header-${index}`}
                    onClick={() => isSortable && onSort(column)}
                    className={isSortable ? styles.sortableHeader : ''}
                    style={{ cursor: isSortable ? 'pointer' : 'default' }}
                  >
                    <div className={styles.headerContent}>
                      {column}
                      {isActive && (
                        <span className={styles.sortIcon}>
                          {sortOrder === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {columns.map((column, colIndex) => {
                    // Try to match column name to object key.
                    // For flexible data, sometimes column "Name" maps to "name".
                    // Let's try lowercase mapping first.
                    let key = column.toLowerCase();
                    if (column === "Data Nasc.") key = "data nasc.";

                    const rawValue = _.get(row, key, _.get(row, column, ""));

                    const formatted = formatValue(column, rawValue);
                    return (
                      <td key={`cell-${rowIndex}-${colIndex}`}>
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles.noData}>
                  Sem dados disponíveis
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paging && (
        <div className={styles.pagination}>
          <button
            disabled={paging.page <= 0}
            onClick={() => onPageChange(paging.page - 1)}
            className={styles.pageBtn}
          >
            Anterior
          </button>

          <span className={styles.pageInfo}>
            Página {(paging.page || 0) + 1} de {Math.ceil(paging.total / paging.pageSize) || 1}
          </span>

          <button
            disabled={!paging.hasMore}
            onClick={() => onPageChange((paging.page || 0) + 1)}
            className={styles.pageBtn}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
