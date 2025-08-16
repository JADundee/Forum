/**
 * Reusable data table component for displaying tabular data.
 * Supports sorting, custom row rendering, and empty state message.
 *
 * @param {Object[]} columns - Array of column definitions
 * @param {Object[]} data - Array of data objects to display
 * @param {string} emptyMsg - Message to display when no data is present
 * @param {Function} renderRow - Function to render a table row
 * @param {Object} sortConfig - Sorting configuration
 * @param {Function} onSort - Function to handle sorting
 */

const DataTable = ({
  columns,
  data,
  emptyMsg,
  renderRow,
  sortConfig,
  onSort,
}) => (
  <div className={"table-scroll-wrapper"}>
    {/* Table for displaying data with sortable columns */}
    <table className={"table"}>
      <thead className={"table__thead"}>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={col.className}
              onClick={col.sortable ? () => onSort(col.key) : undefined}>
              {/* Column label and sort indicator */}
              <span className="table__header-text">{col.label}</span>
              {col.sortable && sortConfig && sortConfig.key === col.key ? (
                <span>{sortConfig.direction === "desc" ? "▼" : "▲"}</span>
              ) : (
                ""
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Render empty message or data rows */}
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>
              {emptyMsg}
            </td>
          </tr>
        ) : (
          data.map(renderRow)
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;
