from fastapi import APIRouter,Depends,status
from fastapi.exceptions import HTTPException
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import joinedload, Session
from models import User,Order
from schemas import OrderModel,OrderStatusModel
from database import get_db
from fastapi.encoders import jsonable_encoder

order_router=APIRouter(
    prefix="/orders",
    tags=['orders']
)

def _choice_code(val):
    """Extract the uppercase code from a SQLAlchemy ChoiceType value.
    In SQLite the value is a Choice object with .code attribute;
    when already a plain string just return it uppercased."""
    if hasattr(val, 'code'):
        return val.code
    return str(val).upper() if val else None

def order_to_dict(order):
    """Convert an Order to a plain dict, including user info if loaded."""
    d = {
        "id": order.id,
        "quantity": order.quantity,
        "pizza_size": _choice_code(order.pizza_size) or "SMALL",
        "order_status": _choice_code(order.order_status) or "PENDING",
        "user_id": order.user_id,
    }
    # Include user info if eagerly loaded (admin endpoints)
    if hasattr(order, 'user') and order.user is not None:
        d["user"] = {
            "id": order.user.id,
            "username": order.user.username,
        }
    return d


@order_router.get('/')
async def hello(Authorize:AuthJWT=Depends()):

    """
        ## A sample hello world route
        This returns Hello world
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )
    return {"message":"Hello World"}


@order_router.post('/order',status_code=status.HTTP_201_CREATED)
async def place_an_order(order:OrderModel,Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):
    """
        ## Placing an Order
        This requires the following
        - quantity : integer
        - pizza_size: str
    
    """


    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    current_user=Authorize.get_jwt_subject()

    user=db.query(User).filter(User.username==current_user).first()


    new_order=Order(
        pizza_size=order.pizza_size,
        quantity=order.quantity
    )

    new_order.user=user

    db.add(new_order)

    db.commit()


    response={
        "pizza_size": _choice_code(new_order.pizza_size) or "SMALL",
        "quantity":new_order.quantity,
        "id":new_order.id,
        "order_status": _choice_code(new_order.order_status) or "PENDING"
    }

    return response



    
@order_router.get('/orders')
async def list_all_orders(Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):
    """
        ## List all orders
        This lists all  orders made. It can be accessed by superusers
        
    
    """


    try:
        Authorize.jwt_required()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    current_user=Authorize.get_jwt_subject()

    user=db.query(User).filter(User.username==current_user).first()

    if user.is_staff:
        orders=db.query(Order).options(joinedload(Order.user)).all()

        return [order_to_dict(o) for o in orders]

    raise  HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not a superuser"
        )


@order_router.get('/orders/{id}')
async def get_order_by_id(id:int,Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):
    """
        ## Get an order by its ID
        This gets an order by its ID and is only accessed by a superuser
        

    """


    try:
        Authorize.jwt_required()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    user=Authorize.get_jwt_subject()

    current_user=db.query(User).filter(User.username==user).first()

    if current_user.is_staff:
        order=db.query(Order).options(joinedload(Order.user)).filter(Order.id==id).first()

        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return order_to_dict(order)

    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not alowed to carry out request"
        )

    
@order_router.get('/user/orders')
async def get_user_orders(Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):
    """
        ## Get a current user's orders
        This lists the orders made by the currently logged in users
    
    """


    try:
        Authorize.jwt_required()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    user=Authorize.get_jwt_subject()


    current_user=db.query(User).filter(User.username==user).first()

    return [order_to_dict(o) for o in current_user.orders]


@order_router.get('/user/order/{id}/')
async def get_specific_order(id:int,Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):
    """
        ## Get a specific order by the currently logged in user
        This returns an order by ID for the currently logged in user
    
    """


    try:
        Authorize.jwt_required()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    subject=Authorize.get_jwt_subject()

    current_user=db.query(User).filter(User.username==subject).first()

    orders=current_user.orders

    for o in orders:
        if o.id == id:
            return order_to_dict(o)
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
        detail="No order with such id"
    )


@order_router.put('/order/update/{id}/')
async def update_order(id:int,order:OrderModel,Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):
    """
        ## Updating an order
        This udates an order and requires the following fields
        - quantity : integer
        - pizza_size: str
    
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Token")

    order_to_update=db.query(Order).filter(Order.id==id).first()

    if not order_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Order not found")

    order_to_update.quantity=order.quantity
    order_to_update.pizza_size=order.pizza_size

    db.commit()


    response={
                "id":order_to_update.id,
                "quantity":order_to_update.quantity,
                "pizza_size":str(order_to_update.pizza_size) if order_to_update.pizza_size else "SMALL",
                "order_status":str(order_to_update.order_status) if order_to_update.order_status else "PENDING",
            }

    return response

    
@order_router.patch('/order/update/{id}/')
async def update_order_status(id:int,
        order:OrderStatusModel,
        Authorize:AuthJWT=Depends(),
        db: Session = Depends(get_db)):


    """
        ## Update an order's status
        This is for updating an order's status and requires ` order_status ` in str format
    """
    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Token")

    username=Authorize.get_jwt_subject()

    current_user=db.query(User).filter(User.username==username).first()

    if current_user.is_staff:
        order_to_update=db.query(Order).filter(Order.id==id).first()

        if not order_to_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Order not found")

        order_to_update.order_status=order.order_status

        db.commit()

        response={
                "id":order_to_update.id,
                "quantity":order_to_update.quantity,
                "pizza_size":str(order_to_update.pizza_size) if order_to_update.pizza_size else "SMALL",
                "order_status":str(order_to_update.order_status) if order_to_update.order_status else "PENDING",
            }

        return response

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not a superuser"
        )


@order_router.delete('/order/delete/{id}/',status_code=status.HTTP_204_NO_CONTENT)
async def delete_an_order(id:int,Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):

    """
        ## Delete an Order
        This deletes an order by its ID
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Token")

    order_to_delete=db.query(Order).filter(Order.id==id).first()

    if not order_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Order not found")

    db.delete(order_to_delete)
    db.commit()

    return None