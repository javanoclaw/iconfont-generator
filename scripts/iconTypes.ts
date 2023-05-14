import { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

export type IconProps = Omit<CustomIconComponentProps, "width" | "height" | "fill"> & {
  width?: string | number;
  height?: string | number;
  fill?: string;
  onClick?: () => void; // 添加点击事件
};
