from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from models import User, Order
from schemas import OrderModel, OrderStatusModel
from database import get_db
from sqlalchemy.orm import Session, joinedload
from fastapi.encoders import jsonable_encoder
from jwt_helper import AuthJWT

order_router = APIRouter(
    prefix="/orders",
    tags=['orders']
)


# Pizza prices
PIZZA_PRICES = {
    "SMALL": 1000,
    "MEDIUM": 1500,
    "LARGE": 2500,
    "EXTRA-LARGE": 4500
}


def get_order_response(order):
    pizza_size = str(order.pizza_size).upper()
    unit_price = PIZZA_PRICES.get(pizza_size, 0)
    total_price = unit_price * order.quantity

    try:
        order_user = order.user
    except Exception:
        order_user = None

    name = None
    username = None
    if order_user:
        name = order_user.name or order_user.username
        username = order_user.username

    return {
        "id": order.id,
        "pizza_size": pizza_size,
        "quantity": order.quantity,
        "unit_price": unit_price,
        "total_price": total_price,
        "order_status": order.order_status,
        "name": name,
        "username": username,
    }


@order_router.get('/')
async def hello(Authorize: AuthJWT = Depends()):

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

    return {"message": "Hello World"}


@order_router.post('/order', status_code=status.HTTP_201_CREATED)
async def place_an_order(order: OrderModel, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
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

    current_user = Authorize.get_jwt_subject()

    user = db.query(User).filter(User.username == current_user).first()

    pizza_size = order.pizza_size.upper()

    if pizza_size not in PIZZA_PRICES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pizza size. Use SMALL, MEDIUM, LARGE, or EXTRA-LARGE"
        )

    new_order = Order(
        pizza_size=pizza_size,
        quantity=order.quantity
    )

    new_order.user = user

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    response = get_order_response(new_order)

    return jsonable_encoder(response)


@order_router.get('/orders')
async def list_all_orders(Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
    """
        ## List all orders
        This lists all orders made. It can be accessed by superusers
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    current_user = Authorize.get_jwt_subject()

    user = db.query(User).filter(User.username == current_user).first()

    if user.is_staff:
        orders = db.query(Order).options(joinedload(Order.user)).order_by(Order.id.asc()).all()

        response = [get_order_response(order) for order in orders]

        return jsonable_encoder(response)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="You are not a superuser"
    )


@order_router.get('/orders/{id}')
async def get_order_by_id(id: int, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
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

    user = Authorize.get_jwt_subject()

    current_user = db.query(User).filter(User.username == user).first()

    if current_user.is_staff:
        order = db.query(Order).options(joinedload(Order.user)).filter(Order.id == id).first()

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        return jsonable_encoder(get_order_response(order))

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User not allowed to carry out request"
    )


@order_router.get('/user/orders')
async def get_user_orders(Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
    """
        ## Get a current user's orders
        This lists the orders made by the currently logged in user
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    user = Authorize.get_jwt_subject()

    current_user = db.query(User).options(joinedload(User.orders).joinedload(Order.user)).filter(User.username == user).first()

    if current_user is None:
        return jsonable_encoder([])

    response = [get_order_response(order) for order in current_user.orders]

    return jsonable_encoder(response)


@order_router.get('/user/order/{id}/')
async def get_specific_order(id: int, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
    """
        ## Get a specific order by the currently logged in user
        This returns an order by ID for the currently logged in user
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    subject = Authorize.get_jwt_subject()

    current_user = db.query(User).options(joinedload(User.orders).joinedload(Order.user)).filter(User.username == subject).first()

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No order with such id"
        )

    for order in current_user.orders:
        if order.id == id:
            return jsonable_encoder(get_order_response(order))

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No order with such id"
    )


@order_router.put('/order/update/{id}/')
async def update_order(id: int, order: OrderModel, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
    """
        ## Updating an order
        This updates an order and requires the following fields
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

    order_to_update = db.query(Order).options(joinedload(Order.user)).filter(Order.id == id).first()

    if order_to_update is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    pizza_size = order.pizza_size.upper()

    if pizza_size not in PIZZA_PRICES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pizza size. Use SMALL, MEDIUM, LARGE, or EXTRA-LARGE"
        )

    order_to_update.quantity = order.quantity
    order_to_update.pizza_size = pizza_size

    db.commit()
    db.refresh(order_to_update)

    response = get_order_response(order_to_update)

    return jsonable_encoder(response)


@order_router.patch('/order/update/{id}/')
async def update_order_status(
        id: int,
        order: OrderStatusModel,
        Authorize: AuthJWT = Depends(),
        db: Session = Depends(get_db)
):

    """
        ## Update an order's status
        This is for updating an order's status and requires `order_status` in str format
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    username = Authorize.get_jwt_subject()

    current_user = db.query(User).filter(User.username == username).first()

    if current_user.is_staff:
        order_to_update = db.query(Order).options(joinedload(Order.user)).filter(Order.id == id).first()

        if order_to_update is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        order_to_update.order_status = order.order_status

        db.commit()
        db.refresh(order_to_update)

        response = get_order_response(order_to_update)

        return jsonable_encoder(response)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="You are not a superuser"
    )


@order_router.delete('/order/delete/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def delete_an_order(id: int, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):

    """
        ## Delete an Order
        This deletes an order by its ID
    """

    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    order_to_delete = db.query(Order).filter(Order.id == id).first()

    if order_to_delete is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    db.delete(order_to_delete)
    db.commit()

    return order_to_delete
