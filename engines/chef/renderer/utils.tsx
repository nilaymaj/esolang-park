import { Icon } from "@blueprintjs/core";
import { Colors } from "@blueprintjs/core";

/** Common border color for dark and light, using transparency */
export const BorderColor = Colors.GRAY3 + "55";

/** Map from item type to corresponding icon */
export const ItemTypeIcons: { [k: string]: React.ReactNode } = {
  dry: <Icon icon="ring" size={12} color={Colors.RED3} />,
  liquid: <Icon icon="tint" size={12} color={Colors.BLUE3} />,
  unknown: <Icon icon="help" size={12} color={Colors.ORANGE3} />,
};
