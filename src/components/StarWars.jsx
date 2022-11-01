import { Box, TableCell, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
// import StarWareTable from "./StarWareTable";
import style from "./StarWars.module.css";
import axios from "axios";
import EnhancedTableToolbar, { EnhancedTableHead } from "./StarWareTable";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import AdbOutlinedIcon from "@mui/icons-material/AdbOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function StarWars() {
  const [characters, setCharacters] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchCharacter, setSearchCharacter] = useState("");
  const [data, setData] = useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  //   const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  async function fetchSearch(searchCharacters) {
    setIsFetching(true);
    const searchResults = await axios.get(`https://swapi.dev/api/people/?search=${searchCharacters}`).then((response) => response.data.results);
    setAdditionalData(searchResults);
  }

  async function fetchData() {
    setIsFetching(true);
    const pageResults = await axios
      .get(`https://swapi.dev/api/people/?page=${page + 1}`)
      .then((response) => response.data.results)
      .catch((error) => console.log(error));
    setAdditionalData(pageResults);
  }

  async function setAdditionalData(results) {
    for (let character of results) {
      //   character = formatData(character);
      character.speciesName = await fetchSpecies(character);
      character.homeworldName = await fetchHomeworld(character);
    }
    // cachePage(results);
    setCharacters([...results]);
  }

  function fetchSpecies(character) {
    let species = "Human";
    if (character.species.length > 0) {
      species = axios
        .get(character.species[0])
        .then((response) => response.data.name)
        .catch((error) => console.log(error));
    }
    return species;
  }

  function fetchHomeworld(character) {
    return axios
      .get(character.homeworld)
      .then((response) => response.data.name)
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    // fetch("https://swapi.dev/api/people/")
    //   .then((res) => res.json())
    //   .then((res) => {
    //     setData(res.results);
    //   });
    fetchData();
  }, []);

  function getSpeciesIcon(speciesName) {
    if (speciesName === "Human") {
      return <PermIdentityOutlinedIcon />;
    } else if (speciesName === "Droid") {
      return <AdbOutlinedIcon />;
    } else {
      return <HelpOutlineOutlinedIcon />;
    }
  }

  console.log(characters);
  return (
    <Box className={style.container}>
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
              <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={characters.length} />
              <TableBody>
                {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.sort(getComparator(order, orderBy)).slice() */}
                {/* {stableSort(data, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) */}
                {characters.map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.name}>
                      <TableCell component="th" id={labelId} scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.hair_color}</TableCell>
                      <TableCell align="right">{row.height}</TableCell>
                      <TableCell align="right">{row.mass}</TableCell>
                      <TableCell align="right">{getSpeciesIcon(row.speciesName)}</TableCell>
                    </TableRow>
                  );
                })}
                {/* {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={characters.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
        </Paper>
      </Box>
    </Box>
  );
}

export default StarWars;
