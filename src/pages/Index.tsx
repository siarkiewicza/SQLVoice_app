
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Database, PlayCircle } from "lucide-react";

const Index = () => {
  const [dbName, setDbName] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [tableData, setTableData] = useState<{ columns: string[]; rows: any[][] }>({
    columns: [],
    rows: [],
  });
  const { toast } = useToast();

  const connectDatabase = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ database: dbName }),
      });
      const data = await response.json();
      toast({
        title: "Database Connection",
        description: data.message || data.error,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the database",
        variant: "destructive",
      });
    }
  };

  const runQuery = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_query: userQuery }),
      });
      const data = await response.json();
      
      setSqlQuery(data.sql_query || "Error generating SQL.");
      setSummary(data.results_summary || "Error summarizing results.");
      
      if (data.columns && data.rows) {
        setTableData({ columns: data.columns, rows: data.rows });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute query",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              SQL Voice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Database Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Select Database</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter database name"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                />
                <Button onClick={connectDatabase}>
                  <Database className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </div>
            </div>

            {/* Query Input */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Enter Your Query</h2>
              <Textarea
                placeholder="Enter natural language query"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={runQuery} className="w-full">
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Query
              </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Results</h2>
              <Card className="bg-white/50 backdrop-blur">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <h3 className="font-medium text-gray-700">SQL Query:</h3>
                    <pre className="mt-2 rounded bg-gray-50 p-4 text-sm">{sqlQuery}</pre>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Summary:</h3>
                    <p className="mt-2 text-gray-600">{summary}</p>
                  </div>

                  {tableData.columns.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Table Results:</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {tableData.columns.map((column, index) => (
                                <TableHead key={index}>{column}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableData.rows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell key={cellIndex}>{cell}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
