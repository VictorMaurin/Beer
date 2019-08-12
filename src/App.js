import React from 'react';
import './App.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';  
import filterFactory, { textFilter, Comparator, numberFilter } from 'react-bootstrap-table2-filter';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; 
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import ls from 'local-storage';

const cmp = {
  '!=': (val1, val2) => val1 !== val2,
  '>': (val1, val2) => val1 > val2,
  '>=': (val1, val2) => val1 >= val2,
  '=': (val1, val2) => val1 = val2,
  '<': (val1, val2) => val1 < val2,
  '<=': (val1, val2) => val1 <= val2, 
}

const nb = (str) => {

  for (let i = 1; i < str.length; i++) {
    if (str[i] === '/') {
      return str.substr(i + 1, str.length - 1)
    }
  }
}

// const getId = (id) => {
  
//   if (id > 80) {
//     id = getId(id - 80)
//   }
//   return (id)
// }

const columns_fiche = [{
  dataField: 'name',
  text: 'Nom de la biere',
},
{
  dataField: 'description',
  text: 'description'
},
{
  dataField: 'brewers_tips',
  text: 'tips'
}]

const columns = [{
  dataField: 'name',
  mode: 'click',
  text: 'Nom de la biere',
  filter: textFilter()
},
{
  dataField: 'ibu',
  text: 'Amertume',
  filter: numberFilter()
},
{
  dataField: 'abv',
  text: "Alcool",
  filter: numberFilter()
},
{
  isDummyField: true,
  dataField: '',
  formatter: (cell, row) => ( 
    <button onClick={() => window.location.replace(`/biere/${row.id}`)}>Plus d'info</button>
  )
}
];

const RemoteAll = ({ data, page, sizePerPage, onTableChange, totalSize }) => (
  <div>
    <BootstrapTable
      remote
      keyField="id"
      data={data}
      columns={columns}
      filter={filterFactory()}
      pagination={paginationFactory({ page, sizePerPage, totalSize, hideSizePerPage: true, })}
      onTableChange={onTableChange}
      />
  </div>
);

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      id: 1,
      singleBiere: [],
      pag: 1,
      page: 6,
      biere: [],
      sizePerPage: 80,
      totalSize: 350,
    }

    this.getBiere = this.getBiere.bind(this)
    this.handleTableChange = this.handleTableChange.bind(this)
  }

  getSingleBiere(id) {
    fetch("https://api.punkapi.com/v2/beers/" + id, {
      method: 'GET'
    }).then((Response) => Response.json())
      .then((Response) => {
        this.setState({
          singleBiere: Response,
        })
      })
  }
  
  getBiere(page) {
    fetch("https://api.punkapi.com/v2/beers?page=" + page + "&per_page=80", {
      method: 'GET'
    }).then((Response) => Response.json())
      .then((Response) => {
        this.setState({
          pag: page,
          biere: Response,
        })
        ls.set('biere', Response)
      })
  }

  componentDidMount() {
    if (window.location.pathname !== '/') {
      let nombre = nb(window.location.pathname)
      let idBiere = parseInt(nombre, 10)
      this.getSingleBiere(idBiere)
    }
    else {
      this.getBiere(this.state.pag)
    }
  }
  
  handleTableChange = (type, { filters, page}) => {
    if (type === "filter") {
    let result = this.state.biere;
    result = result.filter((row) => {
      let valid = true;
      for (const dataField in filters) {
        const { filterVal, filterType, comparator } = filters[dataField];

        if (filterType === 'TEXT') {
          if (comparator === Comparator.LIKE) {
            if (row[dataField] != null) {
              valid = row[dataField].toString().indexOf(filterVal) > -1;
            }
          } else {
            valid = row[dataField] === filterVal;
          }
        }
        else {
          if (comparator === Comparator.LIKE) {
            if (row[dataField] != null) {
              if (dataField === 'ibu') {
                valid = cmp[filters.ibu.filterVal.comparator](row[dataField], filters.ibu.filterVal.number)
              }
              else if (dataField === 'abv') {
                valid = cmp[filters.abv.filterVal.comparator](row[dataField], filters.abv.filterVal.number)
              }
            }
          } else {
            valid = row[dataField] === filterVal;
          }
        }
        if (!valid) break;
      }
      return valid;
    });
    this.setState(() => ({
      biere: result
    }))
  }
  else {
    this.getBiere(page);
  }
  }
  
  render() {

    const { biere, page, sizePerPage, totalSize } = this.state;

    if (window.location.pathname === '/') {
      return (
        <div>
          <button type="button" className="btn btn-dark"
          onClick={() => window.location.replace('/')}
          >
            accueil
          </button>
          <RemoteAll
          data={ biere }
          page={ page }
          sizePerPage={ sizePerPage }
          totalSize={ totalSize }
          onTableChange={this.handleTableChange}
          />
        </div>
      )
    }
    else {
      return (
        <div>
          <button type="button" className="btn btn-dark"
            onClick={() => window.location.replace('/')}
          >
            Liste des bieres
        </button>
          <BootstrapTable
            keyField="id"
            data={this.state.singleBiere}
            columns={columns_fiche}
          />
        </div>
      )
    }
  }
}


export default App;
