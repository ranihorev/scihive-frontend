/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { makeStyles, Theme, createStyles } from '@material-ui/core';

const arrowGenerator = (color: string) => {
  return {
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.95em',
      width: '2em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${color} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.95em',
      width: '2em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${color} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.95em',
      height: '2em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${color} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.95em',
      height: '2em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${color}`,
      },
    },
  };
};

const useStylesArrow = makeStyles((theme: Theme) => {
  return createStyles({
    arrow: {
      position: 'absolute',
      fontSize: 6,
      '&::before': {
        content: '""',
        margin: 'auto',
        display: 'block',
        width: 0,
        height: 0,
        borderStyle: 'solid',
      },
    },
    popper: arrowGenerator('rgba(51, 51, 51, 0.9)'),
    tooltip: {
      position: 'relative',
      backgroundColor: 'rgba(51, 51, 51, 0.9)',
    },
    tooltipPlacementLeft: {
      margin: '0 8px',
    },
    tooltipPlacementRight: {
      margin: '0 8px',
    },
    tooltipPlacementTop: {
      margin: '8px 0',
    },
    tooltipPlacementBottom: {
      margin: '8px 0',
    },
  });
});

export const ArrowTooltip: React.FC<TooltipProps> = props => {
  const [arrowRef, setArrowRef] = React.useState<HTMLSpanElement | null>(null);
  const { arrow, ...classes } = useStylesArrow();

  return (
    <Tooltip
      classes={classes}
      PopperProps={{
        popperOptions: {
          modifiers: {
            arrow: {
              enabled: Boolean(arrowRef),
              element: arrowRef,
            },
          },
        },
      }}
      css={css`
        position: relative;
      `}
      {...props}
      title={
        <React.Fragment>
          {props.title}
          <span ref={setArrowRef} className={arrow} />
        </React.Fragment>
      }
    />
  );
};
