export class EventCounter {
    private buffer: Array<number> = Array(10).fill(0);
    private currentIndex: number = 0;
    private eventCount: number = 0;
    private totalEvents: number = 0;
  
    constructor() {
      setInterval(() => this.updateBuffer(), 1000);
    }
  
    public inc(): void {
      this.eventCount++;
    }
  
    public getPerSecond(): number {
      return this.totalEvents / this.buffer.length;
    }
  
    private updateBuffer(): void {
      this.totalEvents -= this.buffer[this.currentIndex] || 0;
      this.buffer[this.currentIndex] = this.eventCount;
      this.totalEvents += this.eventCount;
      
      this.eventCount = 0;
      
      this.currentIndex = (this.currentIndex + 1) % this.buffer.length;
    }
}