/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, Select, TextField } from '@material-ui/core';
import { isEmpty } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '../../../actions';
import { Group, RootState, T_Highlight, VISIBILITIES, Visibility, VisibilityType } from '../../../models';
import { presets } from '../../../utils';

interface TipProps {
  onConfirm: (comment: T_Highlight['comment'], visibility: Visibility) => void;
  onOpen: () => void;
  isLoggedIn: boolean;
  username?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  groups: Group[];
  setCommentVisibilty: (settings: Visibility) => void;
  visibilitySettings: Visibility;
}

export const CompactTip: React.FunctionComponent = ({ children }) => (
  <div
    css={css`
      ${presets.col};
      color: white;
      padding: 7px 7px;
      background-color: #bbb;
      border-radius: 10px;
    `}
  >
    {children}
  </div>
);

interface VisibilityControlProps extends Pick<TipProps, 'visibilitySettings' | 'groups' | 'username'> {
  onVisibiltyChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
}

const VisibilityControl: React.FC<VisibilityControlProps> = ({
  visibilitySettings,
  onVisibiltyChange,
  groups,
  username,
}) => {
  const fontSize = 13;
  const textMinWidth = 70;
  return (
    <div css={[presets.col, { fontSize }]}>
      <div css={[presets.row, { alignItems: 'center' }]}>
        <div css={{ minWidth: textMinWidth }}>Share with:</div>
        <Select
          value={
            visibilitySettings.type === 'group'
              ? visibilitySettings.id
              : visibilitySettings.type === 'anonymous'
              ? 'public'
              : visibilitySettings.type
          }
          css={{ marginLeft: 5, minWidth: 120, '& .MuiSelect-select': { fontSize } }}
          onChange={onVisibiltyChange}
          native={true}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      <div css={[presets.row, { alignItems: 'center', marginTop: 5 }]}>
        <div css={{ minWidth: textMinWidth }}>Share as:</div>
        <Select
          value={visibilitySettings.type}
          css={{ marginLeft: 5, minWidth: 120, '& .MuiSelect-select': { fontSize } }}
          onChange={onVisibiltyChange}
          native={true}
        >
          <option value="public">{username}</option>
          {['anonymous', 'public'].includes(visibilitySettings.type) && <option value="anonymous">Anonymous</option>}
        </Select>
      </div>
    </div>
  );
};

const CompactTipButton: React.FC<{ onClick: (e: React.MouseEvent) => void; icon: string; text: string }> = ({
  onClick,
  icon,
  text,
}) => (
  <div
    css={[
      presets.row,
      {
        alignItems: 'center',
        fontSize: 14,
        cursor: 'pointer',
        marginBottom: 5,
        padding: 3,
        '&:hover': { color: presets.themePalette.primary.main },
        '&:last-child': {
          marginBottom: 0,
        },
      },
    ]}
    role="button"
    onClick={onClick}
  >
    <i className={icon} css={{ marginRight: 6 }} />
    <div>{text}</div>
  </div>
);

const Tip: React.FC<TipProps> = ({
  isLoggedIn,
  username,
  onConfirm,
  onOpen,
  onMouseDown = () => {},
  groups,
  setCommentVisibilty,
  visibilitySettings,
}) => {
  const firstFocus = React.useRef(true);
  const [isCompact, setIsCompact] = React.useState(true);
  const [text, setText] = React.useState('');

  const onSubmit = (event: React.MouseEvent | React.FormEvent) => {
    event.preventDefault();
    onConfirm({ text }, visibilitySettings);
  };

  const onVisibiltyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    if ((VISIBILITIES as Readonly<string[]>).includes(value)) {
      setCommentVisibilty({ type: value as VisibilityType });
    } else {
      setCommentVisibilty({ type: 'group', id: value });
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
            icon="fas fa-comment-medical"
            text="Comment"
          />
          <CompactTipButton onClick={onSubmit} icon="fas fa-highlighter" text="Highlight" />
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
          <div css={{ marginTop: 10 }}>
            {isLoggedIn ? (
              <VisibilityControl {...{ groups, visibilitySettings, onVisibiltyChange, username }} />
            ) : (
              <div
                css={css`
                  font-size: 12px;
                  color: #9f9f9f;
                `}
              >
                Please log in to add private and list comments
              </div>
            )}
          </div>
          <div css={[presets.row, { width: '100%', justifyContent: 'flex-end', marginTop: 15 }]}>
            <Button type="submit" variant="contained" color="primary" size="small">
              Submit
            </Button>
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
    username: state.user.userData && state.user.userData.username,
    groups: state.user.groups.filter(g => paperGroupsIds.includes(g.id)),
    visibilitySettings: state.paper.commentVisibilty,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setCommentVisibilty: (visibility: Visibility) => {
      dispatch(actions.setCommentVisibilitySettings(visibility));
    },
  };
};
const withRedux = connect(mapStateToProps, mapDispatchToProps);

export default withRedux(Tip);
