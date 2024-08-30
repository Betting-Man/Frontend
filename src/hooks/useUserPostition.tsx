// 유저 위치 정해주기
export default function useUserposition(n : number){
    const rows = Math.ceil(n / 2);
    const matrix = Array.from({ length: rows }, () => Array(2).fill(0));
    
    let num = 1;
    let left = 0, right = 1, top = 0, bottom = rows - 1;
    
    while (num <= n) {
        // 상단 가로줄
        for (let i = left; i <= right && num <= n; i++) {
            matrix[top][i] = num++;
        }
        top++;
        
        // 오른쪽 세로줄
        for (let i = top; i <= bottom && num <= n; i++) {
            matrix[i][right] = num++;
        }
        right--;
        
        // 하단 가로줄
        for (let i = right; i >= left && num <= n; i--) {
            matrix[bottom][i] = num++;
        }
        bottom--;
        
        // 왼쪽 세로줄
        for (let i = bottom; i >= top && num <= n; i--) {
            matrix[i][left] = num++;
        }
        left++;
    }
    
    const leftArray : string[] = [];
    const rightArray : string[] = [];

    matrix.forEach(row => {
        if (row[0] !== 0) leftArray.push(`User${row[0]}`);
        if (row[1] !== 0) rightArray.push(`User${row[1]}`);
    });

    return { leftArray, rightArray };
}