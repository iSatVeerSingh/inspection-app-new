<?php

namespace App\Utils;

use App\Http\Resources\InspectionItemLibraryResource;
use App\Models\Company;
use App\Models\InspectionItem;
use App\Models\Job;
use App\Models\Report;
use DateTime;
use Illuminate\Support\Facades\Storage;
use TCPDF;

class ReportPdf extends TCPDF
{
  public mixed $logo;
  public string $jobType;
  public string $jobNumber;

  public function GetImageFromBase64(string $base64)
  {
    $img = explode(",", $base64)[1];
    return '@' . base64_decode($img);
  }

  public function Header()
  {
    $this->setFont('Times', "", 11);
    $this->Image($this->logo, 5, 5, 50, 0, "PNG");
    $this->Text(575, 10, $this->getAliasNumPage());
  }

  public function Footer()
  {
    $this->setFont('', "", 9);
    $this->setTextColor(0, 32, 96);
    $this->Text(50, -20, $this->jobNumber . " - " . $this->jobType . " - Inspection Report", 0, false);
  }

  protected function TitlePage(Job $job, mixed $template)
  {
    $company = Company::first();

    $topImage = $this->GetImageFromBase64($template['images']['topImage']);
    // Draw top image
    $this->Image($topImage, 0, 0, 595, 0, "PNG");

    // Draw bottom image
    $bottomImage = $this->GetImageFromBase64($template['images']['bottomImage']);
    $this->Image($bottomImage, 0, 617, 595, 0, "PNG");

    // Draw middle logo image

    $logo = $this->GetImageFromBase64($template['images']['logoImage']);
    $this->Image($logo, 172, 125, 250, 0, 'PNG');

    $categoryType = $job->category['type'];

    // // Draw Title
    $this->SetTextColor(0, 32, 96);
    $this->SetY(450);
    $this->SetX(400);
    $this->SetFontSize(33);
    $this->Cell(125, 0, $categoryType, 0, 1, "R", false, "");
    $this->SetY(490);
    $this->SetX(400);
    $this->Cell(125, 0, 'INSPECTION REPORT', 0, 1, "R", false, "");
    $this->SetY(530);
    $this->SetX(400);
    $this->Cell(125, 0, '& DEFECTS LIST', 0, 1, "R", false, "");
    $this->SetTextColor(64, 64, 64);
    $this->SetFontSize(18);
    $this->SetY(565);
    $this->SetX(400);
    $this->Cell(125, 0, $job['siteAddress'], 0, 1, "R", false, "");

    $this->SetFont('Times', '', 11);
    $this->SetTextColor(0, 32, 96);
    $this->SetY(755);
    $this->SetX(375);
    $this->Cell(125, 0, 'Call us on: ' . $company['phone'], 0, 1, "", false, "");
    $this->SetY(767);
    $this->SetX(375);
    $this->SetFont('Times', 'U', 11);
    $this->Cell(125, 0, $company['email'], 0, 1, "", false, "mailto:" . $company['email']);
    $this->SetY(778);
    $this->SetX(375);
    $this->SetFont('Times', 'U', 11);
    $this->Cell(125, 0, $company['website'], 0, 1, "", false, "https://" . $company['website']);
    $this->SetY(789);
    $this->SetX(375);
    $this->SetFont('Times', '', 11);
    $this->Cell(125, 0, 'Postal Address: ' . $company['addressLine1'], 0, 1, "", false, "");
    $this->SetY(801);
    $this->SetX(375);
    $this->Cell(125, 0, $company['addressLine2'], 0, 1, "", false, "");
  }

  public function SetHeading(string $heading)
  {
    $this->Bookmark($heading, 0, 0, "", "B", [0, 32, 96]);
    $this->setFont('', 'B', 13);
    $this->setTextColor(255, 255, 255);
    $this->SetFillColor(0, 32, 96);
    $this->SetFillColor(0, 32, 96);
    $this->Cell(0, 25, $heading, 0, 1, "", true);
    $this->Ln(5);
    $this->setFont('', '', 11);
    $this->setTextColor(0, 0, 0);
  }

  public function MiniDetails(string $property, string $value)
  {
    $this->SetTextColor(0, 0, 0);
    $this->setFontSize(11);
    $this->writeHTML('<table style="padding-left: 5pt;">
    <tr>
      <td style="width: 130pt; font-weight: bold;">' . $property .  ':</td>
      <td style="font-weight: normal;">' . $value . '</td>
    </tr>
  </table>', false, false, true, false);
  }

  public function InspectionNotes(mixed $notes)
  {
    $this->SetHeading('Inspection Notes');
    $this->setTextColor(0, 0, 0);
    $this->setFont('', '', 11);
    $noteStr = '';
    if (is_array($notes)) {
      $notesList = "";

      foreach ($notes as $note) {
        $notesList = $notesList . "<li>" . $note . "</li>";
      }

      $noteStr = $noteStr . '<span>At the time of this inspection, we note the following;</span><ol>' . $notesList . '</ol>';
    } else {
      $noteStr = "N/A";
    }
    $this->writeHTML($noteStr);
    $this->Ln(10);
  }

  public function MakePdf(Job $job, Report $report)
  {
    set_time_limit(180);

    $template = Storage::json('report-template.json');
    $this->logo = $this->GetImageFromBase64($template['images']['headerLogo']);

    $this->jobType = $job->category['type'];
    $this->jobNumber = $job['jobNumber'];
    // $this->logo = $template['images']['logoImage'];

    $customer = $job->customer;
    $this->setAuthor($job->inspector['first'] . " " . $job->inspector['last']);
    $this->setCreator('Correct Inspections');
    $this->setTitle($this->jobNumber . " - " . $this->jobType . " - Inspection Report");
    $this->setMargins(50, 50, 50);
    $this->setPrintFooter(false);
    $this->setAutoPageBreak(false);
    $this->setFont('Times', "", 11);

    $tagvs = [
      'p' => [
        0 => ['h' => 0, 'n' => 0],
        1 => ['h' => 0, 'n' => 0]
      ],
      'ol' => [
        0 => ['h' => 0, 'n' => 0.3],
        1 => ['h' => 0, 'n' => 0.3]
      ],

    ];
    $this->setHtmlVSpace($tagvs);

    $this->AddPage();
    $this->TitlePage($job, $template);
    $this->AddPage();
    $this->setPrintFooter(true);
    $this->setAutoPageBreak(true, 25);
    $this->setCellHeightRatio(1.2);

    $this->SetHeading('Client & Property Details');
    $this->MiniDetails("Client Name(s)", $customer['nameOnReport']);
    $this->MiniDetails("Subject Property", $job['siteAddress']);
    $this->Ln(10);
    $this->SetHeading('Inspection & Report Details');
    $this->MiniDetails("Inspection Date", $job['startsAt']->format('l jS F Y'));
    $this->MiniDetails("Inspection Time", $job['startsAt']->format('h:i A'));
    $this->MiniDetails("Stage of Works", $job->category['stageOfWorks']);
    $this->MiniDetails("Date of this Report", (new DateTime())->format('l jS F Y'));
    $this->Ln(10);
    $this->InspectionNotes($report['inspectionNotes']);
    $this->SetHeading('Report Summary');
    $previousCount = $report->inspectionItems()->where('previousItem', true)->count();
    $newCount = $report->inspectionItems()->where('previousItem', false)->count();
    $recommendation = $report['recommendation'];

    $summary = '<p>' . $newCount . ' new items added in this report</p>';
    if ($previousCount !== 0) {
      $summary = '<p>' . $previousCount . ' items added from previous report.</p>' . $summary;
    }

    $summary = $summary . '<p> Total ' . $previousCount + $newCount . ' items added in this report.</p>';
    if ($recommendation) {
      $summary = $summary . '<p> Recommendation by inspector: ' . $recommendation . '</p>';
    }
    $this->writeHTML($summary, false, false, true);;
    $this->Ln(10);
    $this->SetHeading('Report Purpose');
    $purpose = $template['sections']['Report Purpose'];
    $this->writeHTML($purpose, false, false, true);
    $this->Ln(10);
    $this->SetHeading('General');
    $general = $template['sections']['General'];
    $this->writeHTML($general, false, false, true);
    $this->writeHTML($job->inspector['first'] . " " . $job->inspector['last']);
    $inspectorPhone = $job->inspector['phone'];
    if ($inspectorPhone) {
      $this->writeHTML($inspectorPhone);
    }
    $this->Ln(10);

    $inspectionItems = $report->inspectionItems->map(function (InspectionItem $inspectionItem) {
      if (!$inspectionItem['library_item_id']) {
        $inspectionItem['totalHeight'] = $inspectionItem['height'];
        return $inspectionItem;
      }
      $libItem = $inspectionItem->libraryItem;
      $totalHeight = $inspectionItem['height'] + $libItem['height'];
      $inspectionItem['library_item'] = $libItem;
      $inspectionItem['totalHeight'] = $totalHeight;
      if ($inspectionItem['previousItem']) {
        $prevItem = $inspectionItem->prevReportItem;
        $allImages = [];
        array_push($allImages, ...$inspectionItem['images'], ...$prevItem['images']);
        $inspectionItem['images'] = $allImages;
      }
      return $inspectionItem;
    })->all();

    $previousItems = [];
    $newItems = [];

    foreach ($inspectionItems as $insItem) {
      if ($insItem['previousItem']) {
        array_push($previousItems, $insItem);
      } else {
        array_push($newItems, $insItem);
      }
    }

    if (count($previousItems) !== 0) {
      $this->AddPage();
      $this->SetHeading('Incomplete Items from our Previous Report');
      $this->Ln(10);
      usort($previousItems, function ($a, $b) {
        return $b->totalHeight - $a->totalHeight;
      });

      $maxContentHeight = 750;

      $finalPrevious = [];

      for ($i = 0; $i < count($previousItems); $i++) {
        $itemA = $previousItems[$i];

        $isAExist = array_search($itemA['id'], array_column($finalPrevious, 'id'));
        if ($isAExist) {
          continue;
        }

        $itemA['pageBreak'] = true;
        array_push($finalPrevious, $itemA);

        if (count($itemA['images']) > 8) {
          continue;
        }

        if ($itemA['totalHeight'] > 600 && $itemA['totalHeight'] <= $maxContentHeight) {
          continue;
        }

        if ($i === count($previousItems) - 1) {
          break;
        }

        $remainingSpace = 750;
        if ($maxContentHeight >= $itemA['totalHeight']) {
          $remainingSpace = $maxContentHeight - $itemA['totalHeight'];
        } else {
          $remainingSpace = 2 * $maxContentHeight - $itemA['totalHeight'];
        }

        $secondItem = null;
        $diff = $remainingSpace;

        for ($j = $i + 1; $j < count($previousItems); $j++) {
          $itemB = $previousItems[$j];

          $isBExist = array_search($itemB['id'], array_column($finalPrevious, 'id'));
          if ($isBExist) {
            continue;
          }

          if ($itemB['totalHeight'] < $remainingSpace && $remainingSpace - $itemB['totalHeight'] < $diff) {
            $secondItem = $itemB;
            $diff = $remainingSpace - $itemB['totalHeight'];
          }
        }

        if ($secondItem) {
          $secondItem['pageBreak'] = false;
          array_push($finalPrevious, $secondItem);
        }
      }

      $lastItem = array_pop($finalPrevious);
      $lastItem['pageBreak'] = false;
      array_unshift($finalPrevious, $lastItem);

      foreach ($finalPrevious as $index => $inspectionItem) {
        $itemContent = "";
        $name = '<p style="font-weight: bold;">' . $inspectionItem['name'] . "</p>";

        $itemContent = $itemContent . $name;

        $openingParagraph = "";
        $closingParagraph = "";

        $embeddedImages = "";
        if (!$inspectionItem['library_item']) {
          $openingParagraph = $inspectionItem['openingParagraph'];
          $closingParagraph = $inspectionItem['closingParagraph'];
        } else {
          $openingParagraph = $inspectionItem['library_item']['openingParagraph'];
          $closingParagraph = $inspectionItem['library_item']['closingParagraph'];

          if ($inspectionItem['library_item']['embeddedImages']) {
            $embImages = $inspectionItem['library_item']['embeddedImages'];
            $embCols = '';
            $embRows = '';
            foreach ($embImages as $key => $embimg) {
              $embElement = '<td style="text-align: center;"><img src="' . $embimg . '" style="display: block; width: 200pt;"></td>';
              $embCols = $embCols . $embElement;

              if ($key % 2 !== 0) {
                $embRows = $embRows . '<tr>' . $embCols . '</tr>';
                $embCols = '';
              }

              if ($key % 2 === 0 && $key === count($embImages) - 1) {
                $embRows = $embRows . '<tr>' . $embCols . '</tr>';
              }
            }

            $embeddedImages = '<table><tbody>' . $embRows . '</tbody></table>';
          }
        }

        $itemContent = $itemContent . $openingParagraph;



        if ($inspectionItem['note'] && $inspectionItem['note'] !== "") {
          $noteText = '<p>Note:</p>' . '<p>' . $inspectionItem['note'] . '</p>';
          $itemContent = $itemContent . $noteText;
        }

        $images = $inspectionItem['images'];
        $imgcols = '';
        $imgRows = '';
        foreach ($images as $i => $imgStr) {
          $imgElement = "";
          if ($i % 2 === 0 && $i === count($images) - 1) {
            $imgElement = '<td colspan="2" style="text-align: center;"><img src="' . $imgStr . '" style="width: 200pt; height: 200pt;"></td>';
          } else {
            $imgElement = '<td><img src="' . $imgStr . '" style="display: block; width: 200pt; height: 200pt;"></td>';
          }
          $imgcols = $imgcols . $imgElement;

          if ($i % 2 !== 0) {
            $imgRows = $imgRows . '<tr>' . $imgcols . '</tr>';
            $imgcols = '';
          }

          if ($i % 2 === 0 && $i === count($images) - 1) {
            $imgRows = $imgRows . '<tr>' . $imgcols . '</tr>';
          }
        }

        $imgTable = '<table><tbody>' . $imgRows . '</tbody></table>';
        $itemContent = $itemContent . $imgTable;

        $itemContent = $itemContent . $closingParagraph;

        if ($embeddedImages !== "") {
          $itemContent = $itemContent . $embeddedImages;
        }

        $serial = '<td style="width: 20pt; border-top: 1pt solid #002060;">' . $index + 1 . "</td>";
        $column = '<td style="width: 475pt; border-top: 1pt solid #002060;">' . $itemContent . "</td>";

        $row = '<tr style="vertical-align: top;">' . $serial . $column . "</tr>";
        $table = '<table style="width: 495pt; border: 1pt solid #002060;"><tbody>' . $row . "</tbody></table>";

        if ($inspectionItem['pageBreak']) {
          $this->AddPage();
        }
        $this->writeHTML($table, false, false, true, false);
      }
    }

    $this->AddPage();
    $this->SetHeading("Schedule of Newly Identified Building Defects");
    $text = $template['sections']['Schedule of Building Defects'];
    $this->writeHTML($text, false, false, true);
    $this->Ln(10);

    usort($newItems, function ($a, $b) {
      return $b->totalHeight - $a->totalHeight;
    });

    $maxContentHeight = 750;

    $finalNew = [];

    for ($i = 0; $i < count($newItems); $i++) {
      $itemA = $newItems[$i];

      $isAExist = array_search($itemA['id'], array_column($finalNew, 'id'));
      if ($isAExist) {
        continue;
      }

      $itemA['pageBreak'] = true;
      array_push($finalNew, $itemA);

      if (count($itemA['images']) > 8) {
        continue;
      }

      if ($itemA['totalHeight'] > 600 && $itemA['totalHeight'] <= $maxContentHeight) {
        continue;
      }

      if ($i === count($newItems) - 1) {
        break;
      }

      $remainingSpace = 750;
      if ($maxContentHeight >= $itemA['totalHeight']) {
        $remainingSpace = $maxContentHeight - $itemA['totalHeight'];
      } else {
        $remainingSpace = 2 * $maxContentHeight - $itemA['totalHeight'];
      }

      $secondItem = null;
      $diff = $remainingSpace;

      for ($j = $i + 1; $j < count($newItems); $j++) {
        $itemB = $newItems[$j];

        $isBExist = array_search($itemB['id'], array_column($finalNew, 'id'));
        if ($isBExist) {
          continue;
        }

        if ($itemB['totalHeight'] < $remainingSpace && $remainingSpace - $itemB['totalHeight'] < $diff) {
          $secondItem = $itemB;
          $diff = $remainingSpace - $itemB['totalHeight'];
        }
      }

      if ($secondItem) {
        $secondItem['pageBreak'] = false;
        array_push($finalNew, $secondItem);
      }
    }

    $lastItem = array_pop($finalNew);
    $lastItem['pageBreak'] = false;
    array_unshift($finalNew, $lastItem);

    foreach ($finalNew as $index => $inspectionItem) {
      $itemContent = "";
      $name = '<p style="font-weight: bold;">' . $inspectionItem['name'] . "</p>";

      $itemContent = $itemContent . $name;

      $openingParagraph = "";
      $closingParagraph = "";

      $embeddedImages = "";
      if (!$inspectionItem['library_item']) {
        $openingParagraph = $inspectionItem['openingParagraph'];
        $closingParagraph = $inspectionItem['closingParagraph'];
      } else {
        $openingParagraph = $inspectionItem['library_item']['openingParagraph'];
        $closingParagraph = $inspectionItem['library_item']['closingParagraph'];

        if ($inspectionItem['library_item']['embeddedImages']) {
          $embImages = $inspectionItem['library_item']['embeddedImages'];
          $embCols = '';
          $embRows = '';
          foreach ($embImages as $key => $embimg) {
            $embElement = '<td style="text-align: center;"><img src="' . $embimg . '" style="display: block; width: 200pt;"></td>';
            $embCols = $embCols . $embElement;

            if ($key % 2 !== 0) {
              $embRows = $embRows . '<tr>' . $embCols . '</tr>';
              $embCols = '';
            }

            if ($key % 2 === 0 && $key === count($embImages) - 1) {
              $embRows = $embRows . '<tr>' . $embCols . '</tr>';
            }
          }

          $embeddedImages = '<table><tbody>' . $embRows . '</tbody></table>';
        }
      }

      $itemContent = $itemContent . $openingParagraph;



      if ($inspectionItem['note'] && $inspectionItem['note'] !== "") {
        $noteText = '<p>Note:</p>' . '<p>' . $inspectionItem['note'] . '</p>';
        $itemContent = $itemContent . $noteText;
      }

      $images = $inspectionItem['images'];
      $imgcols = '';
      $imgRows = '';
      foreach ($images as $i => $imgStr) {
        $imgElement = "";
        if ($i % 2 === 0 && $i === count($images) - 1) {
          $imgElement = '<td colspan="2" style="text-align: center;"><img src="' . $imgStr . '" style="width: 200pt; height: 200pt;"></td>';
        } else {
          $imgElement = '<td><img src="' . $imgStr . '" style="display: block; width: 200pt; height: 200pt;"></td>';
        }
        $imgcols = $imgcols . $imgElement;

        if ($i % 2 !== 0) {
          $imgRows = $imgRows . '<tr>' . $imgcols . '</tr>';
          $imgcols = '';
        }

        if ($i % 2 === 0 && $i === count($images) - 1) {
          $imgRows = $imgRows . '<tr>' . $imgcols . '</tr>';
        }
      }

      $imgTable = '<table><tbody>' . $imgRows . '</tbody></table>';
      $itemContent = $itemContent . $imgTable;

      $itemContent = $itemContent . $closingParagraph;

      if ($embeddedImages !== "") {
        $itemContent = $itemContent . $embeddedImages;
      }

      $serial = '<td style="width: 20pt; border-top: 1pt solid #002060;">' . $index + 1 . "</td>";
      $column = '<td style="width: 475pt; border-top: 1pt solid #002060;">' . $itemContent . "</td>";

      $row = '<tr style="vertical-align: top;">' . $serial . $column . "</tr>";
      $table = '<table style="width: 495pt; border: 1pt solid #002060;"><tbody>' . $row . "</tbody></table>";

      if ($inspectionItem['pageBreak']) {
        $this->AddPage();
      }
      $this->writeHTML($table, false, false, true, false);
    }

    $this->AddPage();
    $this->SetHeading('Builder’s Responsibility To Rectify');
    $responsibility = $template['sections']['Builder’s Responsibility To Rectify'];
    $this->writeHTML($responsibility, false, false, true);

    $this->AddPage();
    $this->SetHeading('Terms & Conditions for the Provision of this Report');
    $terms = $template['sections']['Terms & Conditions for the Provision of this Report'];
    $this->writeHTML($terms, false, false, true);

    $this->addTOCPage();
    $this->setFont('', 'B', 13);
    $this->setTextColor(255, 255, 255);
    $this->SetFillColor(0, 32, 96);
    $this->SetFillColor(0, 32, 96);
    $this->Cell(0, 25, 'Table Of Contents', 0, 1, "", true);
    $this->Ln(5);
    $this->setFont('', '', 11);
    $this->setTextColor(0, 0, 0);

    $bookmark_templates = [];

    $bookmark_templates[0] = '<table><tbody><tr><td width="475pt">#TOC_DESCRIPTION#</td><td>#TOC_PAGE_NUMBER#</td></tr></tbody></table>';

    $this->setFont('', '', 11);
    $this->addHTMLTOC(2, 'TOC', $bookmark_templates);
    $this->endTOCPage();
  }
}
