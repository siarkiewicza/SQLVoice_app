
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Database, PlayCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const [dbName, setDbName] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tableData, setTableData] = useState<{ columns: string[]; rows: any[][] }>({
    columns: [],
    rows: [],
  });
  const { toast } = useToast();

  const connectDatabase = async () => {
    try {
      setLoading(true);
      setProgress(30);
      const response = await fetch("http://127.0.0.1:8000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ database: dbName }),
      });
      setProgress(100);
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
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const runQuery = async () => {
    try {
      setLoading(true);
      setProgress(30);
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_query: userQuery }),
      });
      setProgress(70);
      const data = await response.json();
      
      setSqlQuery(data.sql_query || "Error generating SQL.");
      setSummary(data.results_summary || "Error summarizing results.");
      setProgress(100);
      
      if (data.columns && data.rows) {
        setTableData({ columns: data.columns, rows: data.rows });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 md:p-8">
      {loading && (
        <Progress 
          value={progress} 
          className="fixed top-0 left-0 right-0 z-50 h-1 bg-background" 
        />
      )}
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="glass-morphism border-none">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              SQL Voice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Database Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90">Select Database</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter database name"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="neo-blur"
                />
                <Button 
                  onClick={connectDatabase}
                  disabled={loading}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </div>
            </div>

            {/* Query Input */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90">Enter Your Query</h2>
              <Textarea
                placeholder="Enter natural language query"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="min-h-[100px] neo-blur"
              />
              <Button 
                onClick={runQuery} 
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 text-white"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Query
              </Button>
            </div>

            {/* Results Section */}
            {(sqlQuery || summary || tableData.columns.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white/90">Results</h2>
                <Card className="neo-blur">
                  <CardContent className="space-y-4 pt-6">
                    {sqlQuery && (
                      <div>
                        <h3 className="font-medium text-white/90">SQL Query:</h3>
                        <pre className="mt-2 rounded bg-black/40 p-4 text-sm text-white/80 overflow-x-auto">
                          {sqlQuery}
                        </pre>
                      </div>
                    )}

                    {summary && (
                      <div>
                        <h3 className="font-medium text-white/90">Summary:</h3>
                        <p className="mt-2 text-white/80">{summary}</p>
                      </div>
                    )}

                    {tableData.columns.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white/90 mb-2">Table Results:</h3>
                        <div className="rounded-md border border-white/10">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {tableData.columns.map((column, index) => (
                                  <TableHead key={index} className="text-white/90">
                                    {column}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tableData.rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex} className="text-white/80">
                                      {cell}
                                    </TableCell>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
