/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';
import { Chip, Dialog, TextField } from '@material-ui/core';
import axios from 'axios';
import { isEmpty } from 'lodash';
import * as presets from '../utils/presets';
import { actions } from '../actions/categories';

const CategoriesModalRender = ({
  onSelect,
  allCategories,
  selectedCategories,
  setAllCategories,
  isModalOpen,
  toggleCategoriesModal,
  toggleCategory,
}) => {
  const [searchVal, setSearchVal] = React.useState('');

  React.useLayoutEffect(() => {
    if (isEmpty(allCategories)) axios.get('/papers/categories').then(res => setAllCategories(res.data));
  }, []);

  React.useEffect(() => {
    if (!isEmpty(selectedCategories)) onSelect('categories', selectedCategories.join(';'));
  }, [selectedCategories]);

  const re = new RegExp(searchVal, 'i');
  const filteredCategories = searchVal ? allCategories.filter(category => re.test(category.value)) : allCategories;

  return (
    <Dialog open={isModalOpen} onClose={toggleCategoriesModal} fullWidth>
      <div
        css={css`
          ${presets.col}
          padding: 15px;
        `}
      >
        <TextField
          placeholder="Search category"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          fullWidth
          css={css`
            margin-bottom: 15px;
          `}
          autoFocus
        />
        <div
          css={css`
            max-height: 80%;
            overflow-y: auto;
          `}
        >
          {!isEmpty(filteredCategories)
            ? filteredCategories.map(category => (
                <Chip
                  key={category.key}
                  label={category.value}
                  onClick={() => toggleCategory(category.key)}
                  variant={selectedCategories.includes(category.key) ? 'default' : 'outlined'}
                  color="primary"
                  css={css`
                    margin-right: 5px;
                    margin-bottom: 10px;
                  `}
                />
              ))
            : 'No matching categories'}
        </div>
      </div>
    </Dialog>
  );
};

const mapStateToProps = state => {
  return {
    allCategories: state.papersList.allCategories,
    selectedCategories: state.papersList.selectedCategories,
    isModalOpen: state.papersList.isCategoriesModalOpen,
  };
};

const mapDispatchToProps = dispatch => ({
  setAllCategories: categories => dispatch(actions.setAllCategories(categories)),
  toggleCategory: category => dispatch(actions.toggleCategory(category)),
  toggleCategoriesModal: () => dispatch(actions.toggleCategoriesModal()),
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export const CategoriesModal = withRedux(CategoriesModalRender);
