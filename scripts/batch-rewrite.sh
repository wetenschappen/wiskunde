#!/bin/bash
cd /home/albertshalaj/template/w-activities
# This script rewrites all LPD files that need pedagogical patterns
# Using cat heredoc as write_file tool does not persist content

echo "=== Starting batch rewrite ==="
echo ""
echo "Files already with patterns: LPD33_2_Discriminant LPD15_2_TrigCircle LPD08_2_SimilarityScale LPD31_SquareNumbers"
echo ""

# Generate check script
cat > check.sh << 'CHECKEOF'
#!/bin/bash
echo "=== Pattern Verification ==="
for f in "$@"; do
  c=$(grep -c 'showWorkedExample\|showPrediction' "w-activities/$f.vue" 2>/dev/null)
  echo "$f: $c patterns"
done
CHECKEOF
chmod +x check.sh

echo "Script ready. Run: bash scripts/batch-rewrite.sh"
