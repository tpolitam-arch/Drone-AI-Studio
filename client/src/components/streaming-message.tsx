import { useState, useEffect } from "react";

interface StreamingMessageProps {
  content: string;
  speed?: number;
}

export default function StreamingMessage({ content, speed = 30 }: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (speed === 0) {
      // Instant display for real-time streaming
      setDisplayedContent(content);
      setCurrentIndex(content.length);
    } else if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex, speed]);

  useEffect(() => {
    setDisplayedContent("");
    setCurrentIndex(0);
  }, [content]);

  // Convert markdown-like formatting to JSX
  const formatContent = (text: string) => {
    return text
      .split('\n\n')
      .map((paragraph, pIndex) => (
        <p key={pIndex} className={pIndex > 0 ? "mt-4" : ""}>
          {paragraph
            .split('\n')
            .map((line, lIndex) => (
              <span key={lIndex}>
                {lIndex > 0 && <br />}
                {line.split(/(\*\*.*?\*\*)/).map((part, partIndex) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={partIndex} className="font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                })}
              </span>
            ))}
        </p>
      ));
  };

  return (
    <div className="prose prose-sm max-w-none">
      {formatContent(displayedContent)}
      {currentIndex < content.length && (
        <span className="streaming-dot ml-1">●</span>
      )}
    </div>
  );
}
