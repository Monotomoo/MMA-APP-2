import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-body font-normal text-muted-foreground">
            Content coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px]" />
      </Card>
    </div>
  );
};

export default PlaceholderPage;
