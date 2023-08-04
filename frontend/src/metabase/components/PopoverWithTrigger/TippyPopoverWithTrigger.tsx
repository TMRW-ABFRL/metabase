import { useState, useCallback } from "react";

import ControlledPopoverWithTrigger, {
  ControlledPopoverWithTriggerProps,
} from "./ControlledPopoverWithTrigger";

export type TippyPopoverWithTriggerProps = {
  isInitiallyVisible?: boolean;
  onClose?: () => void;
} & Omit<ControlledPopoverWithTriggerProps, "visible" | "onClose" | "onOpen">;

function UncontrolledPopoverWithTrigger({
  isInitiallyVisible,
  onClose,
  ...props
}: TippyPopoverWithTriggerProps) {
  const [visible, setVisible] = useState(isInitiallyVisible || false);

  const handleOpen = useCallback(() => setVisible(true), []);
  const handleClose = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  return (
    <ControlledPopoverWithTrigger
      {...props}
      visible={visible}
      onOpen={handleOpen}
      onClose={handleClose}
    />
  );
}

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default UncontrolledPopoverWithTrigger;
