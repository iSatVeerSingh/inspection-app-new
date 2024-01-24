<p>
  A new item suggestion by Inspector {{ $inspector }}
</p>
<p>
  Category: {{ $item['category'] }}
</p>
<p>
  Name: {{ $item['name'] }}
</p>
<p>
  Summary: {{ $item['summary'] }}
</p>
<p>
  Opening Paragraph {{ $item['openingParagraph'] }}
</p>
<p>
  Closing Paragraph {{ $item['closingParagraph'] }}
</p>
@if (array_key_exists('embeddedImages', $item))
<div>
  Embedded Images:
  @foreach($item->embeddedImages as $imgstr)
  <img width="200" src="{{ $message->embedData($imgstr, 'embedded-img.jpg') }}">
  @endforeach
</div>
@endif