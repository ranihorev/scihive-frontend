// @flow

import React, { Component } from "react";
import "../style/Tip.css";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import {isEmpty} from "lodash";
import {actions} from "../../../actions";
import {connect} from "react-redux";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

type State = {
  compact: boolean,
  text: string,
};
type Visibilty = {
  type: string,
  id?: string,
};

type Props = {
  onConfirm: (comment: { text: string }, visibility: Visibilty) => void,
  onOpen: () => void,
  onUpdate?: () => void,
  tooltipText: React$Element,
  isLoggedIn: boolean,
  selectedGroup: {id: string, name: string},
  toggleLoginModal: () => void,
};

class Tip extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      compact: true,
      text: "",
      visibility: props.selectedGroup ? 'group' : 'public',
      anonymous: false,
    };
  }

  state: State;
  props: Props;

  // for TipContainer
  componentDidUpdate(nextProps: Props, nextState: State) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();
    }
  }

  onSubmit = event => {
    const { text, visibility, anonymous } = this.state;
    event.preventDefault();
    let requestVisibility = {};
    if (visibility === 'public' && anonymous) {
      requestVisibility = {type: 'anonymous'};
    } else if (visibility === 'group') {
      requestVisibility = {type: visibility, id: this.props.selectedGroup.id};
    } else {
      requestVisibility = {type: visibility};
    }
    this.props.onConfirm({ text }, requestVisibility);
  };

  handleVisibilityChange = event => {
    this.setState({visibility: event.target.value});
  };

  handleAnonymousChange = event => {
    this.setState({anonymous: event.target.checked});
  };

  render() {
    const { onOpen, tooltipText, selectedGroup } = this.props;
    const { compact, text, visibility } = this.state;

    return (
      <div className="Tip">
        {compact ? (
          <div
            className="Tip__compact"
            onClick={() => {
              onOpen();
              this.setState({ compact: false });
            }}
          >
            {tooltipText}
          </div>
        ) : (
          <form
            className="Tip__card"
            onSubmit={this.onSubmit}
          >
            <div>
              <TextField
                type="text"
                name="comment"
                label="Your Comment"
                multiline
                margin="normal"
                variant="outlined"
                value={text}
                fullWidth
                onChange={event => this.setState({ text: event.target.value })}
                inputRef={inp => {
                  if (inp) {
                    setTimeout(() => inp.focus(), 100);
                  }
                }}
              />
            </div>
            <div>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
              <FormControl className={'Tip__private'}>
                <Select
                  value={visibility}
                  onChange={this.handleVisibilityChange}
                  input={<Input name="visiblity" />}
                >
                  {
                    selectedGroup ? <MenuItem value="group">{selectedGroup.name}</MenuItem> : null
                  }
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private" disabled={!this.props.isLoggedIn}>
                    Private
                  </MenuItem>
                </Select>
              </FormControl>
              { this.props.isLoggedIn && visibility === 'public' ?
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.anonymous}
                      onChange={this.handleAnonymousChange}
                      color="primary"
                      value="anonymous"
                      classes={{root: 'Tip__anonymous_checkbox'}}
                    />
                  }
                  classes={{root: 'Tip__anonymous'}}
                  label="Post anonymously"
                /> : null
              }
            </div>
            {
              !this.props.isLoggedIn ?
                <div className={'Tip__private_message'}>Please log in to add private comments</div> :
                null
            }

          </form>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    selectedGroup: state.user.selectedGroup,
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleLoginModal: () => {
      dispatch(actions.toggleLoginModal());
    },
  }
}
const withRedux = connect(mapStateToProps, mapDispatchToProps);

export default withRedux(Tip);
