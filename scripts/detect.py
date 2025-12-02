#!/usr/bin/env python3
"""
PPE Detection Script
YOLO 모델을 사용하여 이미지에서 PPE 착용 여부를 감지합니다.
"""
import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO


def detect_ppe(model_path: str, image_path: str):
    """
    이미지에서 PPE를 감지합니다.
    
    Args:
        model_path: YOLO 모델 파일 경로
        image_path: 입력 이미지 경로
    
    Returns:
        감지 결과 딕셔너리
    """
    try:
        # 모델 로드
        model = YOLO(model_path)
        
        # 이미지 읽기
        image = cv2.imread(image_path)
        if image is None:
            return {
                "error": f"Failed to load image: {image_path}",
                "detections": []
            }
        
        # 추론 실행
        results = model(image, verbose=False)
        
        # 결과 파싱
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # 바운딩 박스 좌표
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # 신뢰도 및 클래스
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = model.names[class_id]
                
                detections.append({
                    "class": class_name,
                    "class_id": class_id,
                    "confidence": confidence,
                    "bbox": {
                        "x1": float(x1),
                        "y1": float(y1),
                        "x2": float(x2),
                        "y2": float(y2)
                    }
                })
        
        # 전체 결과 반환
        return {
            "success": True,
            "detections": detections,
            "count": len(detections)
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "detections": []
        }

def main():
    parser = argparse.ArgumentParser(description='PPE Detection using YOLO')
    parser.add_argument('--model', type=str, required=True, help='Path to YOLO model file')
    parser.add_argument('--image', type=str, required=True, help='Path to input image')
    
    args = parser.parse_args()
    
    # 파일 존재 확인
    if not Path(args.model).exists():
        print(json.dumps({"error": f"Model file not found: {args.model}"}))
        sys.exit(1)
    
    if not Path(args.image).exists():
        print(json.dumps({"error": f"Image file not found: {args.image}"}))
        sys.exit(1)
    
    # 감지 실행
    result = detect_ppe(args.model, args.image)
    
    # JSON 출력
    print(json.dumps(result, ensure_ascii=False))
    
    if "error" in result:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()

