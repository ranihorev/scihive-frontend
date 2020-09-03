import React from 'react';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import useReactRouter from 'use-react-router';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles, WithStyles, Theme } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';
import SearchIcon from '@material-ui/icons/Search';
import axios from 'axios';
import * as queryString from 'query-string';

const styles = (theme: Theme) =>
  ({
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
      '&::selection': {
        backgroundColor: '#045494',
      },
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
  } as const);

function renderSuggestion(suggestion: Suggestion, { query, isHighlighted }: Autosuggest.RenderSuggestionParams) {
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

interface Props extends WithStyles<any> {}
interface Suggestion {
  type: string;
  name: string;
  id: string;
}

const SearchBar: React.FC<Props> = ({ classes }) => {
  const { history, location } = useReactRouter();
  const urlQuery = queryString.parse(location.search).q as string;
  const [value, setValue] = React.useState(urlQuery || '');
  const [suggestions, setSuggestions] = React.useState([]);
  const requestId = React.useRef(0);
  const isFocused = React.useRef(false);
  const ref = React.useRef<any>();

  React.useEffect(() => {
    setValue(urlQuery || '');
  }, [urlQuery]);

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleChange = (event: React.FormEvent, { newValue }: { newValue: string }) => {
    setValue(newValue);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // TODO search here
      e.preventDefault();
      e.stopPropagation();
      history.push({ search: `q=${value}` });
      onSuggestionsClearRequested();
    }
  };

  const autosuggestProps = {
    suggestions,
    onSuggestionsClearRequested,
    renderSuggestion,
  };

  return (
    <Autosuggest
      {...autosuggestProps}
      ref={ref}
      renderInputComponent={({ onChange, onBlur, color, ...inputProps }) => {
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
              onChange={e => onChange(e, { newValue: e.target.value, method: 'type' })}
              onBlur={onBlur}
              {...inputProps}
            />
          </div>
        );
      }}
      onSuggestionSelected={(e, { suggestion }: { suggestion: Suggestion }) => {
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
      }}
      getSuggestionValue={suggestion => suggestion.name}
      onSuggestionsFetchRequested={({ value: reqValue, reason }) => {
        if (reason === 'input-changed') {
          const currentId = requestId.current;
          axios
            .get('/papers/autocomplete', { params: { q: reqValue } })
            .then(res => {
              if (currentId + 1 < requestId.current) return; // Ignore old requests
              if (!isFocused.current) return;
              setSuggestions(res.data);
            })
            .catch(err => console.log(err));
          requestId.current++;
        }
      }}
      inputProps={{
        placeholder: 'Search',
        value,
        onChange: handleChange,
        onBlur: () => {
          isFocused.current = false;
        },
        onFocus: () => {
          isFocused.current = true;
        },
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

export default withStyles(styles)(SearchBar);
