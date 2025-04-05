import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Typography,
  Toolbar,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

/**
 * A styled data table component with sorting, pagination, and search
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data rows
 * @param {string} props.title - Table title
 * @param {React.ReactNode} props.actions - Actions to display in the toolbar
 * @param {boolean} props.loading - Whether the table is loading
 * @param {boolean} props.searchable - Whether to show search field
 * @param {function} props.onSearch - Search handler
 * @param {Object} props.sx - Additional styles
 */
const DataTable = ({
  columns = [],
  data = [],
  title,
  actions,
  loading = false,
  searchable = true,
  onSearch,
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  // Sort function
  const sortData = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };
  
  // Comparator function
  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };
  
  // Descending comparator
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };
  
  // Filter data based on search term
  const filteredData = searchTerm && !onSearch
    ? data.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;
  
  // Sort and paginate data
  const sortedData = orderBy
    ? sortData(filteredData, getComparator(order, orderBy))
    : filteredData;
  
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Loading skeleton
  const loadingSkeleton = (
    <>
      {[...Array(rowsPerPage)].map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((column, colIndex) => (
            <TableCell key={`skeleton-cell-${colIndex}`}>
              <Skeleton animation="wave" height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
  
  return (
    <Paper 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
        borderRadius: 2,
        ...sx
      }}
      {...rest}
    >
      {/* Table Toolbar */}
      {(title || searchable || actions) && (
        <Toolbar
          sx={{
            pl: { sm: 3 },
            pr: { xs: 1, sm: 2 },
            pt: 2,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          {/* Title */}
          {title && (
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              {title}
            </Typography>
          )}
          
          {/* Search and Actions */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {searchable && (
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearch}
                sx={{ 
                  minWidth: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            
            {actions && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {actions}
              </Box>
            )}
          </Box>
        </Toolbar>
      )}
      
      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: theme.palette.background.default,
                    whiteSpace: 'nowrap',
                    minWidth: column.minWidth,
                    width: column.width,
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              loadingSkeleton
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={`row-${index}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={`cell-${column.id}-${index}`} align={column.align || 'left'}>
                        {column.render ? column.render(value, row) : (
                          column.chip && value ? (
                            <Chip 
                              label={value} 
                              size="small"
                              color={column.chipColor ? column.chipColor(value, row) : 'default'}
                            />
                          ) : value
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucune donnée disponible
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      />
    </Paper>
  );
};

export default DataTable; 