import React from 'react';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Paper from '@material-ui/core/Paper/index';
import MenuItem from '@material-ui/core/MenuItem/index';
import { withStyles } from '@material-ui/core/styles/index';
import InputBase from '@material-ui/core/InputBase/index';
import { fade } from '@material-ui/core/styles/colorManipulator';
import SearchIcon from '@material-ui/icons/Search';
import axios from 'axios/index';
import { withRouter } from 'react-router';
import * as queryString from 'query-string';

const styles = theme => ({
  container: {
    zIndex: 2,
    position: 'relative',
    '&:focus-within': {
      flexGrow: 1,
    },
    maxWidth: '600px',
    transition: theme.transitions.create('flex-grow'),
  },
  search: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  searchIcon: {
    width: theme.spacing(6),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    display: 'flex',
  },
  inputInput: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(6),
    width: '100%',
  },

  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        placeholder="Search…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputRef={node => {
          ref(node);
          inputRef(node);
        }}
        {...other}
      />
    </div>
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.name, query);
  const parts = parse(suggestion.name, matches);
  const icon = suggestion.type === 'author' ? <i className="far fa-user" /> : <i className="far fa-file-alt" />;

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        <span style={{ fontSize: '85%', paddingRight: '5px' }}>{icon}</span>
        {parts.map((part, index) =>
          part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          ),
        )}
      </div>
    </MenuItem>
  );
}

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

const SearchBar = ({ history, classes, location }) => {
  const { q: urlQuery } = queryString.parse(location.search);
  const [value, setValue] = React.useState(urlQuery || '');
  const [suggestions, setSuggestions] = React.useState([]);

  React.useEffect(() => {
    setValue(urlQuery || '');
  }, [urlQuery]);

  const onSuggestionsFetchRequested = ({ value: reqValue, reason }) => {
    if (reason === 'input-changed') {
      axios
        .get('/papers/autocomplete', { params: { q: reqValue } })
        .then(res => {
          setSuggestions(res.data);
        })
        .catch(err => console.log(err));
    }
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const onKeyDown = e => {
    if (e.keyCode === 13) {
      // TODO search here
      e.preventDefault();
      e.stopPropagation();
      history.push({ search: `q=${e.target.value}` });
    }
  };

  const onSuggestionSelected = (e, { suggestion }) => {
    switch (suggestion.type) {
      case 'author':
        history.push(`/author/${suggestion.name}`);
        break;
      case 'paper':
        history.push(`/paper/${suggestion.id}`);
        break;
      default:
        console.log('Should not be here');
    }
  };

  const autosuggestProps = {
    renderInputComponent,
    suggestions,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    onSuggestionSelected,
  };

  return (
    <Autosuggest
      {...autosuggestProps}
      inputProps={{
        classes,
        placeholder: 'Search',
        value,
        onChange: handleChange,
        onKeyDown,
      }}
      theme={{
        container: classes.container,
        suggestionsContainerOpen: classes.suggestionsContainerOpen,
        suggestionsList: classes.suggestionsList,
        suggestion: classes.suggestion,
      }}
      renderSuggestionsContainer={options => (
        <Paper {...options.containerProps} square>
          {options.children}
        </Paper>
      )}
    />
  );
};

export default withStyles(styles)(withRouter(SearchBar));
