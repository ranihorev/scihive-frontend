/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, Checkbox, FormControl, FormControlLabel, Input, MenuItem, Select, TextField } from '@material-ui/core';
import { CheckboxProps } from '@material-ui/core/Checkbox';
import { SelectProps } from '@material-ui/core/Select';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '../../../actions';
import { RootState, T_Highlight, Visibility, VisibilityType, Group } from '../../../models';
import { presets } from '../../../utils';

interface State {
  compact: boolean;
  text: string;
  visibility: VisibilityType;
  anonymous: boolean;
}

interface TipProps {
  onConfirm: (comment: T_Highlight['comment'], visibility: Visibility) => void;
  onOpen: () => void;
  isLoggedIn: boolean;
  selectedGroup?: Group;
  openGroupsModal: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export const compactButtonStyle = css`
  cursor: pointer;
  padding: 3px;
  margin: 0px 5px;
  &:hover {
    color: ${presets.themePalette.primary.main};
  }
`;

export const CompactTip: React.FunctionComponent = ({ children }) => (
  <div
    css={css`
      ${presets.row};
      ${presets.centered};
      color: white;
      padding: 5px 7px;
      background-color: #bbb;
      border-radius: 10px;
    `}
  >
    {children}
  </div>
);

export const CompactTipButton: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick, children }) => (
  <div css={compactButtonStyle} role="button" onClick={onClick}>
    {children}
  </div>
);

const Tip: React.FC<TipProps> = ({
  isLoggedIn,
  onConfirm,
  onOpen,
  openGroupsModal,
  selectedGroup,
  onMouseDown = () => {},
}) => {
  const [isCompact, setIsCompact] = React.useState(true);
  const [text, setText] = React.useState('');
  const [visibility, setVisibility] = React.useState<VisibilityType>(selectedGroup ? 'group' : 'public');
  const [isAnonymous, setIsAnonymous] = React.useState(false);

  const onSubmit = (event: React.MouseEvent | React.FormEvent) => {
    event.preventDefault();
    let requestVisibility: Visibility;
    if (visibility === 'public' && isAnonymous) {
      requestVisibility = { type: 'anonymous' };
    } else if (visibility === 'group' && selectedGroup) {
      requestVisibility = { type: visibility, id: selectedGroup.id };
    } else {
      requestVisibility = { type: visibility };
    }
    onConfirm({ text }, requestVisibility);
  };

  const handleVisibilityChange: SelectProps['onChange'] = event => {
    setVisibility(event.target.value as VisibilityType);
  };

  const handleAnonymousChange: CheckboxProps['onChange'] = event => {
    setIsAnonymous(event.target.checked);
  };

  return (
    <div className="Tip" onMouseDown={onMouseDown}>
      {isCompact ? (
        <CompactTip>
          <CompactTipButton
            onClick={() => {
              onOpen();
              setIsCompact(false);
            }}
          >
            <i className="fas fa-comment-medical" />
          </CompactTipButton>
          <CompactTipButton onClick={onSubmit}>
            <i className="fas fa-highlighter" />
          </CompactTipButton>
        </CompactTip>
      ) : (
        <form
          css={css`
            padding: 10px;
            background: #fff;
            background-clip: padding-box;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(37, 40, 43, 0.2);
            width: 290px;
            input[type='submit'] {
              margin-top: 5px;
              font-size: large;
            }
          `}
          onSubmit={onSubmit}
        >
          <div>
            <TextField
              type="text"
              name="comment"
              label="Your Comment"
              placeholder="Add a comment (Optional)"
              multiline
              margin="normal"
              variant="outlined"
              value={text}
              fullWidth
              onChange={event => setText(event.target.value)}
              inputRef={inp => {
                if (inp) {
                  setTimeout(() => inp.focus(), 100);
                }
              }}
              css={css`
                textarea {
                  font-size: 16px;
                  min-height: 70px;
                  padding: 4px 10px;
                }
              `}
            />
          </div>
          <div
            css={css`
              ${presets.row};
              font-size: 0.65rem;
              color: grey;
              margin-bottom: 8px;
            `}
          >
            * Type LaTeX formulas using $ signs, e.g. $(3\times 4)$
          </div>
          <div
            css={css`
              ${presets.row}
              margin-bottom: 10px;
              justify-content: space-between;
            `}
          >
            <FormControl>
              <Select value={visibility} onChange={handleVisibilityChange} input={<Input name="visiblity" />}>
                {selectedGroup ? <MenuItem value="group">{selectedGroup.name}</MenuItem> : null}
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private" disabled={!isLoggedIn}>
                  Private
                </MenuItem>
                {!selectedGroup && (
                  <div>
                    <MenuItem
                      value="newGroup"
                      disabled={!isLoggedIn}
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        openGroupsModal();
                      }}
                    >
                      New Group
                    </MenuItem>
                  </div>
                )}
              </Select>
            </FormControl>
            {isLoggedIn && visibility === 'public' ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={handleAnonymousChange}
                    color="primary"
                    value="anonymous"
                    css={css`
                      padding: 3px 5px 3px 12px !important;
                    `}
                  />
                }
                css={css`
                  margin: 0;
                  margin-right: 0 !important;
                `}
                label="Post anonymously"
              />
            ) : null}
          </div>
          <div
            css={css`
              ${presets.row}
              justify-content: flex-end;
            `}
          >
            <Button type="submit" variant="contained" color="primary" size="small">
              Submit
            </Button>
          </div>
          {!isLoggedIn ? (
            <div
              css={css`
                margin-top: 12px;
                font-size: 12px;
                color: #9f9f9f;
              `}
            >
              Please log in to add private comments
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    selectedGroup: state.user.selectedGroup,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    openGroupsModal: () => {
      dispatch(actions.toggleGroupsModal(true));
    },
  };
};
const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Tip);
