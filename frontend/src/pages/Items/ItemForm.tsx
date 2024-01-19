import { FormEventHandler } from "react";
import Card from "../../components/Card";

const ItemForm = () => {
  const handleItemForm: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

  }

  return (
    <Card>
      <form>
        
      </form>
    </Card>
  )
}

export default ItemForm;