import React from 'react';

    const DataTable = ({
    columns,
    data,
    emptyMsg,
    renderRow,
    sortConfig,
    onSort,
    className = '',
    tableClassName = '',
    theadClassName = '',
    }) => (
    <div className={className || 'table-scroll-wrapper'}>
        <table className={tableClassName || 'table'}>
        <thead className={theadClassName || 'table__thead'}>
            <tr>
            {columns.map(col => (
                <th
                key={col.key}
                className={col.className}
                style={col.sortable ? { cursor: 'pointer' } : undefined}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
                >
                <span className="header-text">{col.label}</span>
                {col.sortable && sortConfig && sortConfig.key === col.key ? (
                    <span className="sort-arrow">{sortConfig.direction === 'desc' ? '▼' : '▲'}</span>
                ) : ''}
                </th>
            ))}
            </tr>
        </thead>
        <tbody>
            {data.length === 0
            ? (
                <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center' }}>{emptyMsg}</td>
                </tr>
            )
            : data.map(renderRow)
            }
        </tbody>
        </table>
    </div>
    );

export default DataTable; 