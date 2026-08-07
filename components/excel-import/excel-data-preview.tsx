import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PREVIEW_ROW_LIMIT,
  type ParsedExcelData,
} from "@/lib/excel-import/types";

interface ExcelDataPreviewProps {
  data: ParsedExcelData;
}

export function ExcelDataPreview({ data }: ExcelDataPreviewProps) {
  const previewRows = data.rows.slice(0, PREVIEW_ROW_LIMIT);
  const hiddenCount = Math.max(0, data.totalRows - PREVIEW_ROW_LIMIT);

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-lg">檔案資訊</CardTitle>
          <CardDescription>已解析 Excel 內容，請確認後匯入</CardDescription>
        </div>

        <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Excel 名稱</p>
            <p className="mt-1 truncate text-sm font-semibold">{data.fileName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">工作表名稱</p>
            <p className="mt-1 truncate text-sm font-semibold">{data.sheetName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">資料筆數</p>
            <p className="mt-1 text-sm font-semibold">共有 {data.totalRows} 筆資料</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="mb-3 text-sm font-semibold tracking-tight">資料預覽</p>
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {data.headers.map((header, index) => (
                    <TableHead key={`${header}-${index}`} className="whitespace-nowrap">
                      {header || `欄位 ${index + 1}`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {data.headers.map((_, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className="whitespace-nowrap text-sm"
                      >
                        {row[colIndex] || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {hiddenCount > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            還有 {hiddenCount} 筆未顯示
          </p>
        )}
      </CardContent>
    </Card>
  );
}
