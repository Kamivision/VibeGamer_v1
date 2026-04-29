// client/src/components/layout/SectionCard.jsx
import { Card, CardBody, Typography } from "@material-tailwind/react";

export default function SectionCard({
  title,
  children,
  cardClassName = "",
  bodyClassName = "",
  titleClassName = "",
  contentClassName = "",
}) {
  return (
    <Card className={cardClassName}>
      <CardBody className={bodyClassName}>
        <Typography variant="h5" className={`mb-4 text-left ${titleClassName}`}>
          {title}
        </Typography>
        <div className={`text-left text-gray-700 ${contentClassName}`}>{children}</div>
      </CardBody>
    </Card>
  );
}