/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, TextField } from '@material-ui/core';
import { isEmpty } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '../../../actions';
import { Group, RootState, T_Highlight, VISIBILITIES, Visibility, VisibilityType } from '../../../models';
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
  openGroupsModal: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  groups: Group[];
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
  onMouseDown = () => {},
  groups,
}) => {
  const firstFocus = React.useRef(true);
  const [isCompact, setIsCompact] = React.useState(true);
  const [text, setText] = React.useState('');
  const [visibility, setVisibility] = React.useState<VisibilityType>('public');
  const [selectedGroupId, setSelectedGroupId] = React.useState('');

  const onSubmit = (event: React.MouseEvent | React.FormEvent) => {
    event.preventDefault();
    let requestVisibility: Visibility = { type: visibility };
    if (visibility === 'group') {
      requestVisibility.id = selectedGroupId;
    }
    onConfirm({ text }, requestVisibility);
  };

  const onVisibiltyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if ((VISIBILITIES as Readonly<string[]>).includes(value)) {
      setVisibility(value as VisibilityType);
    } else {
      setVisibility('group');
      setSelectedGroupId(value);
    }
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
            padding: 0px 10px 10px;
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
                if (inp && firstFocus.current) {
                  firstFocus.current = false;
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
              margin-top: 10px;
              justify-content: space-between;
            `}
          >
            <div
              css={css`
                ${presets.row};
                align-items: center;
              `}
            >
              {isLoggedIn ? (
                <select
                  css={css`
                    height: 28px;
                  `}
                  onChange={onVisibiltyChange}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="anonymous">Anonymous</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  css={css`
                    font-size: 12px;
                    color: #9f9f9f;
                  `}
                >
                  Please log in to add private and group comments
                </div>
              )}
            </div>
            <div>
              <Button type="submit" variant="contained" color="primary" size="small">
                Submit
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const paperGroupsIds = state.paper.groupIds;
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    groups: state.user.groups.filter(g => paperGroupsIds.includes(g.id)),
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
