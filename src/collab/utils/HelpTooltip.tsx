import { Tooltip, TooltipProps } from '@material-ui/core';
import React from 'react';

export const HelpTooltip: React.FC<TooltipProps> = ({ ...props }) => {
  return <Tooltip arrow enterDelay={500} enterNextDelay={500} placement="top" {...props} />;
};
