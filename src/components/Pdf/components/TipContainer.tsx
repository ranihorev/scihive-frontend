import React, { Component } from 'react';

import { T_LTWH } from '../../../models';

interface State {
  height: number;
  width: number;
}

interface Props {
  style: { top: number; left: number; bottom: number };
  scrollTop: number;
  pageBoundingRect: T_LTWH;
  children: React.ReactElement[];
}

const clamp = (value: number, left: number, right: number) => Math.min(Math.max(value, left), right);

class TipContainer extends Component<Props, State> {
  container = React.createRef<HTMLDivElement>();
  state = {
    height: 0,
    width: 0,
  };

  componentDidUpdate(nextProps: Props) {
    if (this.props.children !== nextProps.children) {
      this.updatePosition();
    }
  }

  componentDidMount() {
    setTimeout(this.updatePosition, 0);
  }

  updatePosition = () => {
    try {
      if (!this.container.current) return;
      const { offsetHeight, offsetWidth } = this.container.current;

      this.setState({
        height: offsetHeight,
        width: offsetWidth,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  render() {
    const { children, style, scrollTop, pageBoundingRect } = this.props;

    const { height, width } = this.state;

    const isStyleCalculationInProgress = width === 0 && height === 0;

    const shouldMove = style.top - height - 5 < scrollTop;

    const top = shouldMove ? style.bottom + 5 : style.top - height - 5;

    const left = clamp(style.left - width / 2, 0, pageBoundingRect.width - width);

    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, {
        onUpdate: () => {
          this.setState(
            {
              width: 0,
              height: 0,
            },
            () => {
              setTimeout(this.updatePosition, 0);
            },
          );
        },
        popup: {
          position: shouldMove ? 'below' : 'above',
        },
      }),
    );

    return (
      <div
        className="PdfHighlighter__tip-container"
        style={{
          visibility: isStyleCalculationInProgress ? 'hidden' : 'visible',
          top,
          left,
        }}
        ref={this.container}
      >
        {childrenWithProps}
      </div>
    );
  }
}

export default TipContainer;
